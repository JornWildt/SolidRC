class ProfileService extends ORDFMapper
{
  constructor()
  {
    super();
  }
  

  async initialize()
  {
    // Assign RDF type for objects managed by this repository
    this.setObjectType(NS_FOAF('PersonalProfileDocument'));

    // Map RDF predicate/objects into simple javascript key/values.
    this.addMapping(NS_PIM('storage'), 'storage', PropertyType.Raw, false);
    this.addMapping(NS_FOAF('name'), 'name', PropertyType.Raw, false);
    this.addMapping(NS_PIM('preferencesFile'), 'preferencesFile', PropertyType.Uri, false);
    this.addMapping(NS_OWL('sameAs'), 'sameAs', PropertyType.Uri, false);
    this.addMapping(NS_RDFS('seeAlso'), 'seeAlso', PropertyType.Uri, false);

    const session = await solid.auth.currentSession();
    console.debug(session.webId);
    this.profileUrl = session.webId;

    await this.loadAllContainerItems(this.profileUrl);
    this.profile = await this.readProfile();

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
}