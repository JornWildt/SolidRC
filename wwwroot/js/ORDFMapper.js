// List of well known property types that need special handling
const PropertyType =
{
  Raw: 'Raw',

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
    this.linkedPredicateToPropertyMapping = {};
    this.linkedPropertyToPredicateMapping = {};
    this.idProperty = 'id';
    this.objectTypes = [];
  }


  setObjectType(objectType)
  {
    this.objectTypes.push(objectType);
  }


  addMapping(predicate, propertyName, valueType, mutable)
  {
    let mapping = 
    {
      mappingType: MappingType.Direct,
      predicate: predicate.value,
      property: propertyName,
      valueType: valueType,
      mutable: mutable
    };

    this.predicateToPropertyMapping[predicate.value] = mapping;
    this.propertyToPredicateMapping[propertyName] = mapping;
  }


  addLinkedMapping(predicate, targetPredicate, propertyName, valueType)
  {
    let mapping = this.linkedPredicateToPropertyMapping[predicate.value];
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

      this.linkedPredicateToPropertyMapping[predicate.value] = mapping;
      this.linkedPropertyToPredicateMapping[propertyName] = mapping;
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


  async loadAllContainerItems(url)
  {
    console.debug("Load container URL: " + url);

    // Load all items at the URL
    return this.fetcher.load(url).catch(err => console.warn(err));

    // // Find the URLs of the items in the container
    // let folderItemUrls = await this.store.match(this.store.sym(url), NS_LDP('contains'));

    // // Load each item in the container into the local store
    // // (do local catch() to avoid fail-fast in Promise.all())
    // return Promise.all(folderItemUrls.map(itemUrl => 
    //   this.fetcher.load(itemUrl.object).catch(err => console.warn(err))));
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
    url = $rdf.sym(url);
    console.debug("Read object from : " + url);

    // Find all statements having  the object URL as the subject.
    let statements = this.store.match(url, null, null);
    
    console.debug(`Found ${statements.length} statements for ${url}.`);

    // FIXME: we do not always need to fetch linked values - only when presenting a list of items

    // Copy object values from all the statements into a simple javascript object.
    let result = await this.copyStatementsIntoObject(statements);

    return result;
  }


  storeObject(url, obj)
  {
    // Make sure there is one or more "type" statements (which is not a natural part of the user facing object)
    this.objectTypes.forEach(t =>
      this.store.add(url, NS_RDF('type'), t, url));

    // Use supplied mapping to copy the properties into the RDF store
    let statements = this.copyPropertiesIntoStatements(url, obj, 'insert');
    this.store.add(statements);

    //console.debug("Store statements: " + JSON.stringify(statements,null,2));

    // Put the new statements onto the web
    return this.fetcher.putBack(url);
  }


  async updateObject(url, obj)
  {
    // At this point our existing knowledge of the resource at URL may have come from a "globbing"
    // operation (fetching all resources inside a container in one single request).
    // This means we cannot update the original statements directly and patch them back on
    // the globbing URL. 
    // So we need to extract the changed statements, remove all existing knowledge from the
    // local store, refetch from the real resource URL and then do an update/patch.

    // Remove existing statements from local store
    this.store.removeMatches(this.store.sym(url), null, null);
    
    // Load the same statements again, but this time from the real resource URL
    await this.fetcher.load(this.store.sym(url));
    let existingStatements = this.store.match(this.store.sym(url), null, null, null);
    
    //console.debug("existingStatements: " + JSON.stringify(existingStatements,null,2));

    // Create new statements for the changed values
    let insertStatements = this.copyPropertiesIntoStatements(url, obj, 'update');

    //console.debug("insertStatements: " + JSON.stringify(insertStatements,null,2));

    // Find the existing statements that must now be deleted
    // - For some unknown reason, rdflib fails to remove some of the preloaded statements (bug?), 
    //   so delete only those from the real URL (filtering on the "why" component)
    let deleteStatements = existingStatements.filter(st => 
      insertStatements.find(is => is.predicate.value == st.predicate.value && st.why.value == url) != undefined);

    //console.debug("deleteStatements: " + JSON.stringify(deleteStatements,null,2));

    console.debug("Update object: " + url + `(${deleteStatements.length} deletes, ${insertStatements.length} inserts)`);
    return new Promise((accept,reject) => this.updater.update(deleteStatements, insertStatements, 
      (uri,ok,message) => 
      {
        // let existingStatements2 = this.store.match(this.store.sym(url), null, null, this.store.sym(url));
        // console.debug("existingStatements after update: " + JSON.stringify(existingStatements2,null,2));
        if (ok)
          accept();
        else
          reject(message);
      }));
  }


  async deleteObject(url)
  {
    console.debug("Delete object: " + url);
    //DebugJson(this.store.match(this.store.sym(url), null, null, null));
    // Catch errors to make sure we continue deleting all items (no transactional guarantees here!)
    await this.fetcher.delete(url).catch(ex => console.debug(ex) );
    console.debug("Done delete object: " + url);
    
    this.store.removeMatches(this.store.sym(url));
    //console.debug("Removed matches: " + url);
    //DebugJson(this.store.match(this.store.sym(url), null, null, null));

    this.store.removeDocument(this.store.sym(url));
    //console.debug("Removed document: " + url);
    //DebugJson(this.store.match(this.store.sym(url), null, null, null));
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
      result[mapping.property] = null; 
    });

    $.each(this.linkedPredicateToPropertyMapping, (key, mapping) => 
    { 
      mapping.targetMappings.forEach(targetMapping =>
        result[targetMapping.propertyName] = { valid: false, value: `Property '${targetMapping.propertyName}' not available.` });
    });

    // Go through each statement, get the property name from the predicate and set property to the statement object value.
    await Promise.all(statements.map(async st => {
      let mapping = this.predicateToPropertyMapping[st.predicate.value];

      // Simple direct mappings get the property value directly from the value of the statement
      if (mapping)
      {
        let value = st.object.value;

        // If the property type is a URI then unwrap the NamedNode object and extract URI as a plain string.
        if (mapping.PropertyType == PropertyType.Uri)
          value = value.value;

        // Assign the mapped value
        result[mapping.property] = value;
      }

      let linkedMapping = this.linkedPredicateToPropertyMapping[st.predicate.value];

      // Linked mappings assume the statement value is a URL and fetches the data at the URL.
      // It then selects mapped predicates and their values from that document
      if (linkedMapping)
      {
        let url = st.object.value;
        await this.fetcher.load(url)
        .then(() => 
          {
            linkedMapping.targetMappings.forEach(m => {
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
            linkedMapping.targetMappings.forEach(m =>
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


  copyPropertiesIntoStatements(subject, object, mode)
  {
    subject = this.store.sym(subject);
    return Object.entries(object).map(([key,value]) => {
      let mapping = this.propertyToPredicateMapping[key];
      if (mapping !== undefined && value !== undefined)
      {
        if (mode == 'insert' || mode == 'update' && mapping.mutable)
        {
          if (mapping.valueType == PropertyType.Uri && value)
            value = this.store.sym(value);
          if (value !== null)
            return $rdf.st(subject, this.store.sym(mapping.predicate), value, subject);
        }        
      }
    })
    .filter(st => st != undefined);
  }


  generateValidUrlName(name)
  {
    return name.replace(/ /g, '_').replace(/[^-\w0-9_]/g, 'x');
  }


  Debug(x)
  {
    console.debug(x);
    return x;
  }
}
