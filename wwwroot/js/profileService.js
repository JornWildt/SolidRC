class ProfileService extends ORDFMapper
{
  constructor()
  {
    super();
  }
  

  async initialize()
  {
    if (!this.isInitialized)
    {
      this.isInitialized = true;

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

      await this.loadTypeRegistry();
    }
  }


  async readProfile()
  {
    var profile = this.readObject(this.profileUrl);
    return profile;
  }


  async getLocationForType(type, defaultPath)
  {
    await this.loadTypeRegistry();
    let entry = this.typeRegistry[type.value];
    let url = (entry ? entry.url : this.profile.storage + defaultPath);
    return url;
  }


  async updateLocationForType(type, location)
  {
    // Find existing registration
    let entry = this.typeRegistry[type.value];
    let deleteStatements = (entry
      ? this.store.match(entry.subject, null, null, null)
      :  []);

    // Select type registry - either from existing registration or the private reg.
    let registryUrl = (deleteStatements.length > 0 
      ? deleteStatements[0].why 
      : this.store.sym(this.profile.privateTypeIndex));

      let subject = (entry
        ? entry.subject
        : this.store.sym(location + "#" + Math.floor(Date.now()/1000) + 'x' + Math.floor(Math.random()*100)));
      location = this.store.sym(location);

    // Create relevant statements for the registration
    let insertStatements = [
      $rdf.st(subject, NS_SOLID('forClass'), type, registryUrl),
      $rdf.st(subject, NS_SOLID('instanceContainer'), location, registryUrl)
    ];

    console.debug("Update type registry: " + registryUrl + `(${deleteStatements.length} deletes, ${insertStatements.length} inserts)`);

    return new Promise((accept,reject) => this.updater.update(deleteStatements, insertStatements, 
      (uri,ok,message) => 
      {
        // let existingStatements2 = this.store.match(this.store.sym(url), null, null, this.store.sym(url));
        // console.debug("existingStatements after update: " + JSON.stringify(existingStatements2,null,2));
        if (ok)
        {
          // Clear cache - force reload next time
          this.typeRegistry = undefined;
          accept();
        }
        else
          reject(message);
      }));

  }


  async loadTypeRegistry()
  {
    if (this.typeRegistry == undefined)
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
    if (this.typeRegistry == undefined)
    {
      this.typeRegistry = {};

      const sparql = `
  SELECT ?reg ?cl ?loc
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
            this.typeRegistry[result["?cl"].value] = {
              url: result["?loc"].value,
              subject: result["?reg"]
            };
          }
        },
        null,
        () => accept()));
    }
  }
}


ProfileService.instance = new ProfileService();
