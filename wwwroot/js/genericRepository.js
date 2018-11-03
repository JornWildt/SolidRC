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
  }


  /**
   * 
   * @param mapping {object} Mapping dictionary - maps from predicates to resulting object property names.
   */
  initializeMappings(mapping)
  {
    this.predicateToPropertyMapping = mapping;
    this.propertyToPredicateMapping = {};

    $.each(mapping, (key, value) => { this.propertyToPredicateMapping[value] = key; });
  }


  /**
   * Copy values from an array of RDF statements into a single object.
   * 
   * @param statements {Array} Array of statements.
   */
  copyPredicatesIntoObject(statements)
  {
    let result = {};

    // Initialize result by assigning null to all properties such that missing statements/predicates yield a null value.
    $.each(this.predicateToPropertyMapping, (key, value) => { result[value] = null; });

    // Go through each statement, get the property name from the predicate and set property to the statement object value.
    statements.forEach(st => {
      let key = this.predicateToPropertyMapping[st.predicate.value];
      if (key)
        result[key] = st.object.value;
    });

    return result;
  }


  copyPropertiesIntoStatements(subject, item)
  {
    $.each(item, (key,value) => {
      let predicate = this.propertyToPredicateMapping[key];
      console.debug("Save " + predicate + ", " + value + " / " + typeof(this));
      if (predicate != undefined && value != undefined)
        this.store.add(subject, this.store.sym(predicate), value, subject);
    });
  }
}