/** Locations repository with CRUD methods for locations.
 */
class LocationRepository extends ORDFMapper
{
  constructor()
  {
    super();
  }

  
  async initialize()
  {
    // Assign RDF type for objects managed by this repository
    this.setObjectType(NS_SCHEMA('Place'));

    // Map RDF predicate/objects into simple javascript key/values.
    this.addMapping(NS_SCHEMA('dateCreated'), 'created');
    this.addMapping(NS_SCHEMA('author'), 'creator', PropertyType.Uri);
    this.addMapping(NS_SCHEMA('name'), 'name');
    this.addMapping(NS_SCHEMA('sameAs'), 'externalUrl');

    // Load *all* the locations into the store
    return this.loadAllContainerItems(LocationRepository.LocationsUrl);
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

    // location.url could also be the externalUrl, if it exists, but then we have a runtime dependency on that.
    // - so currently we always use the "local" URL and only remember the external URL for later reference.
    //  (location.externalUrl ? location.externalUrl : url);
    
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
    let locationUrl = this.store.sym(LocationRepository.LocationUrl + locationName);

    // Make properties strongly typed for RDFLIB and add extra statements
    location.created = new Date();
    // FIXME: read from current login
    location.creator = 'https://elfisk.solid.community/profile/card#me';

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
    await this.deleteObject(location.id);
  }


  generateLocationName(name)
  {
    name = this.generateValidUrlName(name).toLowerCase();
    return name;
  }
}


LocationRepository.LocationUrl = 'https://elfisk.solid.community/public/solidrc/locations/';
LocationRepository.LocationsUrl = 'https://elfisk.solid.community/public/solidrc/locations/';
