/** Logbook repository with CRUD methods for logbook entries.
 */
class LogbookRepository extends ORDFMapper
{
  constructor()
  {
    super();
    this.profileService = new ProfileService();
  }

  
  async initialize()
  {
    // Assign RDF type(s) for objects managed by this repository
    this.setObjectType(NS_SOLIDRC('Logentry'));
    this.setObjectType(NS_SCHEMA('Event'));

    // Map statement predicate/objects into simple javascript key/values.
    this.addMapping(NS_SCHEMA('dateCreated'), 'created', PropertyType.Raw, false);
    this.addMapping(NS_SCHEMA('author'), 'creator', PropertyType.Uri, false);
    this.addMapping(NS_SCHEMA('startDate'), 'date', PropertyType.Raw, true);
    this.addMapping(NS_SOLIDRC('model'), 'model', PropertyType.Uri, true);
    this.addMapping(NS_SCHEMA('location'), 'location', PropertyType.Uri, true);
    this.addMapping(NS_SCHEMA('duration'), 'duration', PropertyType.Raw, true);
    this.addMapping(NS_SCHEMA('description'), 'comment', PropertyType.Raw, true);
    this.addLinkedMapping(NS_SCHEMA('location'), NS_SCHEMA('name'), 'locationName');
    this.addLinkedMapping(NS_SOLIDRC('model'), NS_SCHEMA('name'), 'modelName');
    this.addLinkedMapping(NS_SOLIDRC('model'), NS_SCHEMA('image'), 'modelImage', PropertyType.Uri);
    this.addLinkedMapping(NS_SOLIDRC('model'), NS_SCHEMA('thumbnail'), 'modelThumbnail', PropertyType.Uri);
    
    await this.profileService.initialize();

    let dataUrl = await this.profileService.getLocationForType(NS_SOLIDRC('data', 'user/rc-data/'));
    this.containerUrl = dataUrl + "logbook/*";
    this.entryUrl = dataUrl + "logbook/";

    // Load *all* the logbook entries into the store
    return this.fetcher.load(this.containerUrl).catch(err => console.debug(err));
  }


  /**
   * Get a list of all logbook entries as simple javascript objects.
   */
  async getEntries(start, count)
  {    
    // Find the subjects of all logbook entries (from statements having type = 'logentry')
    let statements = this.store.match(null, NS_RDF('type'), NS_SOLIDRC('Logentry'));

    // Build a list of all logbook entries by fetching the logbook entry data from each entry URL (subject).
    let entries = Promise.all(statements.map(e => this.readEntryFromUrl(e.subject).catch(err => console.warn(err))));

    // Make sure we always get a consistent sort order
    entries = await entries;
    entries.sort((a,b) => (a.date < b.date ? 1 : -1));

    return {
      total: entries.length,
      entries: entries.slice(start, start+count)
    };
  }


  /**
   * Read a single logbook entry from its URL, assuming it has already been loaded into the store.
   */
  async readEntryFromUrl(url)
  {
    var entry = await this.readObject(url);
    entry.date = new moment(entry.date).format('YYYY-MM-DD');
    let colonCount = countCharacter(entry.duration, ':');
    if (colonCount == 0)
      entry.durationText = entry.duration + ' sec';
    else if (colonCount == 1)
      entry.durationText = entry.duration + ' min';
    else if (colonCount == 2)
      entry.durationText = entry.duration + ' hr';
    else
      entry.durationText = entry.duration;
    return entry;
  }


  /**
   * Add a new logbook entry
   * 
   * @param {date} entry.date Date of flight.
   * @param {URL} entry.model Reference to associated model.
   * @param {URL} entry.location Reference to associated location.
   * @param {timespan} entry.duration Duration of flight.
   */
  addEntry(entry)
  {
    // Generate a unique URL name (path element) for the entry
    let entryName = this.generateEntryName(entry.date);

    // Combine entryName with base URL to get complete URL for new entry
    let entryUrl = this.store.sym(this.entryUrl + entryName + ".ttl");

    // Make properties strongly typed for RDFLIB and add extra statements
    entry.date = new moment(entry.date, 'YYYY-MM-DD').toDate();
    entry.created = new Date();
    location.creator = this.profileService.profile.webId;

    this.storeObject(entryUrl, entry);
  }


  async updateEntry(entry)
  {
    return this.updateObject(entry.id, entry);
  }


  async deleteEntry(entry)
  {
    return this.deleteObject(entry.id);
  }


  generateEntryName(date)
  {
    const timestamp = Math.floor(Date.now() / 1000);
    return 'entry-' + timestamp;
  }
}


