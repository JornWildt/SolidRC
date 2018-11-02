class GenericRepository
{
  /**
   * Copy values from an array of RDF statements into a single object.
   * 
   * @param statements {Array} Array of statements.
   * 
   * @param nameMap {object} Mapping dictionary - maps from predicates to resulting object property names.
   */
  copyPredicatesIntoObject(statements, nameMap)
  {
    let result = {};

    // Initialize result by assigning null to all properties such that missing statements/predicates yield a null value.
    $.each(nameMap, (key, value) => { result[value] = null; });

    // Go through each statement, get the property name from the predicate and set property to the statement object value.
    statements.forEach(st => {
      let key = nameMap[st.predicate];
      if (key)
        result[key] = st.object.value;
    });

    return result;
  }

}