// List of well known property types that need special handling
const PropertyType =
{
  // URI values implies automatical wrapping of values in store.sym(x)
  Uri: 'Uri'
}

const MappingType =
{
  Direct: 'Direct',
  Linked: 'Linked'
}

class ORDFMapper
{
  constructor()
  {
    // This is supposed to be used from a single page application, so initialize a
    // store, fetcher and updater once and for all for this page instance.
    // All repository operations work with these RDF objects.
    this.store = $rdf.graph();
    this.fetcher = new $rdf.Fetcher(this.store);
    this.updater = new $rdf.UpdateManager(this.store);
    this.predicateToPropertyMapping = {};
    this.propertyToPredicateMapping = {};
    this.idProperty = 'id';
  }


  setObjectType(objectType)
  {
    this.objectType = objectType;
  }


  addMapping(predicate, propertyName, valueType)
  {
    let mapping = 
    {
      mappingType: MappingType.Direct,
      predicate: predicate.value,
      property: propertyName,
      valueType: valueType
    };

    this.predicateToPropertyMapping[predicate.value] = mapping;
    this.propertyToPredicateMapping[propertyName] = mapping;
  }


  addLinkedMapping(predicate, targetPredicate, propertyName, valueType)
  {
    let mapping = this.predicateToPropertyMapping[predicate.value];
    if (!mapping || !mapping.targetMappings)
    {
      mapping = 
      {
        mappingType: MappingType.Linked,
        predicate: predicate.value,
        targetMappings:
        [
          {
            predicate: targetPredicate,
            propertyName: propertyName,
            valueType: valueType    
          }
        ]
      };

      this.predicateToPropertyMapping[predicate.value] = mapping;
      this.propertyToPredicateMapping[propertyName] = mapping;
    }
    else
    {
      mapping.targetMappings.push(
      {
        predicate: targetPredicate,
        propertyName: propertyName,
        valueType: valueType
      });
    }
  }


  async readObject(url)
  {
    let result = await this.readObjectInternal(url);

    // Assign ID to the result
    result[this.idProperty] = url.value;

    return result;
  }


  async readObjectInternal(url)
  {
    console.debug("Read object from : " + url);

    // Find all statements having  the object URL as the subject.
    let statements = this.store.match(url, null, null);

    // FIXME: we do not always need to fetch linked values - only when presenting a list of items

    // Copy object values from all the statements into a simple javascript object.
    let result = await this.copyStatementsIntoObject(statements);

    return result;
  }


  storeObject(url, obj)
  {
    // Make sure there is a "type" statement (which is not a natural part of the user facing object)
    this.store.add(url, NS_RDF('type'), this.objectType, url);

    // Use supplied mapping to copy the properties into the RDF store
    let statements = this.copyPropertiesIntoStatements(url, obj);
    this.store.add(statements);

    // Put the new statements onto the web
    this.fetcher.putBack(url);
  }


  updateObject(url, obj)
  {
    let existingStatements = this.store.match(this.store.sym(url), null, null);
    let insertStatements = this.copyPropertiesIntoStatements(url, obj);
    let deleteStatements = existingStatements.filter(st => insertStatements.find(is => is.predicate.value == st.predicate.value) != undefined);
    console.debug(existingStatements);
    console.debug(insertStatements);
    console.debug(deleteStatements);
    return new Promise((accept,reject) => this.updater.update(deleteStatements, insertStatements, 
      (uri,ok,message) => 
      {
        console.debug(uri);
        console.debug(ok);
        console.debug(message);
        if (ok)
          accept();
        else
          reject(message);
      }));
  }


  async deleteObject(url)
  {
    console.debug("Delete object: " + url);
    // Catch errors to make sure we continue deleting all items (no transactional guarantees here!)
    await this.fetcher.delete(url).catch(ex => console.debug(ex) );
    console.debug("Done delete object: " + url);
    this.store.removeMatches(this.store.sym(url));
    this.store.removeDocument(this.store.sym(url));
  }


  /**
   * Copy values from an array of RDF statements into a single object using supplied mappings
   * 
   * @param statements {Array} Array of statements.
   */
  async copyStatementsIntoObject(statements)
  {
    let result = {};

    // Initialize result by assigning null to all properties such that missing statements/predicates yield a null value.
    $.each(this.predicateToPropertyMapping, (key, mapping) => 
    { 
      if (mapping.mappingType == MappingType.Direct)
      {
        result[mapping.property] = null; 
      }
      else
      {
        mapping.targetMappings.forEach(targetMapping =>
          result[targetMapping.propertyName] = { valid: false, value: `Property '${targetMapping.propertyName}' not available.` }
        );
      }
    });

    // Go through each statement, get the property name from the predicate and set property to the statement object value.
    await Promise.all(statements.map(async st => {
      let mapping = this.predicateToPropertyMapping[st.predicate.value];

      // Simple direct mappings get the property value directly from the value of the statement
      if (mapping && mapping.mappingType == MappingType.Direct)
      {
        let value = st.object.value;

        // If the property type is a URI then unwrap the NamedNode object and extract URI as a plain string.
        if (mapping.PropertyType == PropertyType.Uri)
          value = value.value;

        // Assign the mapped value
        result[mapping.property] = value;
      }
      // Linked mappings assume the statement value is a URL and fetches the data at the URL.
      // It then selects mapped predicates and their values from that document
      else if (mapping && mapping.mappingType == MappingType.Linked)
      {
        let url = st.object.value;
        await this.fetcher.load(url)
        .then(() => 
          {
            mapping.targetMappings.forEach(m => {
              let targetStatement = this.store.any(st.object, m.predicate);
              let targetValue = (targetStatement ? targetStatement.value : null);
      
              if (targetValue)
              {
                result[m.propertyName] = 
                {
                  valid: true,
                  value: targetValue
                }
              }
              else
                result[m.propertyName] = 
                {
                  valid: false,
                  value: `Property '${m.propertyName}'not available`
                }
          });
        })
        .catch(err => 
          {
            console.warn(err);
            mapping.targetMappings.forEach(m =>
              result[m.propertyName] =
              {
                valid: false,
                value: `Resource not available (${url})`
              }
            );
          });
      }
    })).catch(err => console.warn(err)); // Not doing anything here - assuming all errors handled inside

    return result;
  }


  decodePropertyTypeValue(mapping, value)
  {
    // If the property type is a URI then unwrap the NamedNode object and extract URI as a plain string.
    if (mapping.valueType == PropertyType.Uri)
      value = value.value;

    return value;
  }


  copyPropertiesIntoStatements(subject, object)
  {
    return Object.entries(object).map(([key,value]) => {
      let mapping = this.propertyToPredicateMapping[key];
      if (mapping != undefined && value != undefined)
      {
        if (mapping.valueType == PropertyType.Uri)
          value = this.store.sym(value);
        return $rdf.st(subject, this.store.sym(mapping.predicate), value, subject);
      }
    })
    .filter(st => st != undefined);
  }


  generateValidUrlName(name)
  {
    return name.replace(/[^-\w0-9_]/g, '-');
  }


  Debug(x)
  {
    console.debug(x);
    return x;
  }
}
