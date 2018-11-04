// List of well known property types that need special handling
const PropertyType =
{
  // URI values implies automatical wrapping of values in store.sym(x)
  Uri: 'Uri'
}

class GenericRepository
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
      predicate: predicate.value,
      property: propertyName,
      valueType: valueType
    };

    this.predicateToPropertyMapping[predicate.value] = mapping;
    this.propertyToPredicateMapping[propertyName] = mapping;
  }


  readObject(url)
  {
    console.debug("Read object from : " + url);

    // Find all statements having  the object URL as the subject.
    let statements = this.store.match(url, null, null);

    // Copy object values from all the statements into a simple javascript object.
    let result = this.copyStatementsIntoObject(statements);

    // Assign ID to the result
    result[this.idProperty] = url.value;

    return result;
  }


  storeObject(url, obj)
  {
    // Make sure there is a "type" statement (which is not a natural part of the user facing object)
    this.store.add(url, NS_RDF('type'), this.objectType, url);

    // Use supplied mapping to copy the properties into the RDF store
    this.copyPropertiesIntoStatements(url, obj);

    // Put the new statements onto the web
    this.fetcher.putBack(url);
  }


  deleteObject(url)
  {
    console.debug("Delete object: " + url);
    // FIXME: error handling
    this.fetcher.delete(url);
    this.store.removeMatches(this.store.sym(url));
    this.store.removeDocument(this.store.sym(url));
  }


  /**
   * Copy values from an array of RDF statements into a single object.
   * 
   * @param statements {Array} Array of statements.
   */
  copyStatementsIntoObject(statements)
  {
    let result = {};

    // Initialize result by assigning null to all properties such that missing statements/predicates yield a null value.
    $.each(this.predicateToPropertyMapping, (key, mapping) => { result[mapping.property] = null; });

    // Go through each statement, get the property name from the predicate and set property to the statement object value.
    statements.forEach(st => {
      let mapping = this.predicateToPropertyMapping[st.predicate.value];
      if (mapping)
      {
        let value = st.object.value;
        if (mapping.PropertyType == PropertyType.Uri)
          value = value.value;
        result[mapping.property] = value;
      }
    });

    return result;
  }


  copyPropertiesIntoStatements(subject, object)
  {
    $.each(object, (key,value) => {
      let mapping = this.propertyToPredicateMapping[key];
      if (mapping != undefined && value != undefined)
      {
        if (mapping.valueType == PropertyType.Uri)
          value = this.store.sym(value);
        this.store.add(subject, this.store.sym(mapping.predicate), value, subject);
      }
    });
  }
}
