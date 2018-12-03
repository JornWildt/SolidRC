class ProfileService extends ORDFMapper
{
  constructor()
  {
    super();
  }
  

  async initialize()
  {
    const solidRcRootContainerPath = 'solid-rc/'

    // Assign RDF type for objects managed by this repository
    this.setObjectType(NS_FOAF('PersonalProfileDocument'));

    // Map RDF predicate/objects into simple javascript key/values.
    this.addMapping(NS_PIM('storage'), 'storage', PropertyType.Raw, false);
    this.addMapping(NS_FOAF('name'), 'name', PropertyType.Raw, false);
    this.addMapping(NS_PIM('preferencesFile'), 'preferencesFile', PropertyType.Uri, false);
    this.addMapping(NS_OWL('sameAs'), 'sameAs', PropertyType.Uri, false);
    this.addMapping(NS_RDFS('seeAlso'), 'seeAlso', PropertyType.Uri, false);
    this.addMapping(NS_SOLID('publicTypeIndex'), 'publicTypeIndex', PropertyType.Uri, false);
    this.addMapping(NS_SOLID('privateTypeIndex'), 'privateTypeIndex', PropertyType.Uri, false);

    const session = await solid.auth.currentSession();
    this.profileUrl = session.webId;

    await this.loadAllContainerItems(this.profileUrl);
    this.profile = await this.readProfile();
    this.profile.webId = session.webId;

    /* NOT USED SO FAR
    
    if (this.profile.preferencesFile)
      await this.loadAllContainerItems(this.profile.preferencesFile);

    if (this.profile.sameAs)
      await this.loadAllContainerItems(this.profile.sameAs);

    if (this.profile.seeAlso)
      await this.loadAllContainerItems(this.profile.seeAlso);
    */
  }


  async readProfile()
  {
    var profile = this.readObject(this.profileUrl);
    return profile;
  }


  async getLocationForType(type, defaultPath)
  {
    await this.loadTypeRegistry();
    let url = ProfileService.typeRegistry[type.value];
    if (!url)
      url = this.profile.storage + defaultPath;
    return url;
  }


  async loadTypeRegistry()
  {
    if (ProfileService.typeRegistry == undefined)
    {
      console.debug("Load: " + this.profile.publicTypeIndex);
      console.debug("Load: " + this.profile.privateTypeIndex);
      let p1 = this.profile.publicTypeIndex != null ? this.fetcher.load(this.profile.publicTypeIndex).catch(err => console.warn(err)) : null;
      let p2 = this.profile.privateTypeIndex != null ? this.fetcher.load(this.profile.privateTypeIndex).catch(err => console.warn(err)) : null;

      await Promise.all([p1,p2]);
      return this.readTypeRegistry();
    }
  }


  // Read all type registrations into local object, assuming the type registration documents has been loaded already
  readTypeRegistry()
  {
    if (ProfileService.typeRegistry == undefined)
    {
      ProfileService.typeRegistry = {};

      const sparql = `
  SELECT ?cl ?loc
  WHERE 
  {
    ?reg <http://www.w3.org/ns/solid/terms#forClass> ?cl.
    ?reg <http://www.w3.org/ns/solid/terms#instanceContainer> ?loc.
  }`
      let query = $rdf.SPARQLToQuery(sparql, false, this.store);
      return new Promise((accept,reject) =>
        this.store.query(query, result =>
        {
          if (result["?cl"] && result["?loc"])
          {
            ProfileService.typeRegistry[result["?cl"].value] = result["?loc"].value;
          }
        },
        null,
        () => accept()));
    }
  }
}
