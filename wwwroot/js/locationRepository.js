const LocationStoragePath = "places/hobby/";


/** Locations repository with CRUD methods for locations.
 */
class LocationRepository extends ORDFMapper
{
  constructor()
  {
    super();
    this.profileService = new ProfileService();
  }

  
  async initialize()
  {
    // Assign RDF type for objects managed by this repository
    this.setObjectType(NS_SOLIDRC('Location'));
    this.setObjectType(NS_SCHEMA('Place'));

    // Map RDF predicate/objects into simple javascript key/values.
    this.addMapping(NS_SCHEMA('dateCreated'), 'created', PropertyType.Raw, false);
    this.addMapping(NS_SCHEMA('author'), 'creator', PropertyType.Uri, false);
    this.addMapping(NS_SCHEMA('name'), 'name', PropertyType.Raw, true);

    await this.profileService.initialize();

    this.containerUrl = this.profileService.profile.storage + LocationStoragePath + "*";
    this.locationUrl = this.profileService.profile.storage + LocationStoragePath;

    // Load *all* the locations into the store
    return this.loadAllContainerItems(this.containerUrl);
  }


  /**
   * Get a list of all locations (from local store) as simple javascript objects.
   */
  async getLocations()
  {    
    // Find the subjects of all locations (from statements having type = 'location')
    let locations = this.store.match(null, NS_RDF('type'), NS_SCHEMA('Place'));

    // Build a list of all locations by fetching the location data from the locations URL (subject)
    let result = await Promise.all(locations.map(l => this.readLocationFromUrl(l.subject).catch(err => console.warn(err))));

    // Make sure we always get a consistent sort order
    result.sort((a,b) => (a.name ? a.name.localeCompare(b.name) : 0));

    return result; 
  }


  /**
   * Read a single location from its URL, assuming it has already been loaded into the store.
   */
  async readLocationFromUrl(url)
  {
    var location = await this.readObject(url);
    location.url = url; 

    return location;
  }


  /**
   * Add a new location
   */
  addLocation(location)
  {
    // Generate a unique URL name (path element) for the location
    let locationName = this.generateLocationName(location.name);

    // Combine locationName with base URL to get complete URL for new location
    let locationUrl = this.store.sym(this.locationUrl + locationName + ".ttl");

    // Make properties strongly typed for RDFLIB and add extra statements
    location.created = new Date();
    location.creator = this.profileService.profile.webId;

    this.storeObject(locationUrl, location);
  }


  /**
   * Update an existing location.
   * @param {object} location 
   */
  async updateLocation(location)
  {
    return this.updateObject(location.id, location);
  }


  async deleteLocation(location)
  {
    // FIXME: error handling
    return this.deleteObject(location.id);
  }


  generateLocationName(name)
  {
    name = this.generateValidUrlName(name).toLowerCase();
    return name;
  }
}

