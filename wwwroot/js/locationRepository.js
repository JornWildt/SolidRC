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
    this.setObjectType(NS_SOLIDRC('location'));

    // Map statement predicate/objects into simple javascript key/values.
    this.addMapping(NS_DCTERM('created'), 'created');
    this.addMapping(NS_DCTERM('creator'), 'creator', PropertyType.Uri);
    this.addMapping(NS_DCTERM('title'), 'name');
    this.addMapping(NS_SOLIDRC('url'), 'url');

    // Load *all* the locations into the store
    try
    {
      await this.fetcher.load(LocationRepository.LocationsUrl);
    }
    catch (err)
    {
      // FIXME: improved error handling should be applied here!
      console.log(err);
    }
  }


  /**
   * Get a list of all locations as simple javascript objects.
   */
  async getLocations()
  {    
    // Find the subjects of all locations (from statements having type = 'location')
    let locations = this.store.match(null, NS_RDF('type'), NS_SOLIDRC('location'));

    // Build a list of all locations by fetching the location data from the locations URL (subject)
    let result = await Promise.all(locations.map(l => this.readLocationFromUrl(l.subject)));

    // Make sure we always get a consistent sort order
    result.sort((a,b) => a.name.localeCompare(b.name))

    return result; 
  }


  /**
   * Read a single location from its URL, assuming it has already been loaded into the store.
   */
  async readLocationFromUrl(url)
  {
    var location = await this.readObject(url);
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

    if (!location.url)
      location.url = locationUrl;

    this.storeObject(locationUrl, location);
  }


  deleteLocation(location)
  {
    // FIXME: error handling
    this.deleteObject(location.id);
  }


  generateLocationName(name)
  {
    const timestamp = Math.floor(Date.now() / 1000);
    return name + '-' + timestamp;
  }
}


LocationRepository.LocationUrl = 'https://elfisk.solid.community/public/solidrc/locations/';
LocationRepository.LocationsUrl = 'https://elfisk.solid.community/public/solidrc/locations/*';
