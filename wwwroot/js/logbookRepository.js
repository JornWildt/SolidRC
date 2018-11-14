/** Logbook repository with CRUD methods for logbook entries.
 */
class LogbookRepository extends ORDFMapper
{
  constructor()
  {
    super();
  }

  
  async initialize()
  {
    // Assign RDF type for objects managed by this repository
    this.setObjectType(NS_SOLIDRC('logentry'));

    // Map statement predicate/objects into simple javascript key/values.
    this.addMapping(NS_DCTERM('created'), 'created');
    this.addMapping(NS_DCTERM('creator'), 'creator', PropertyType.Uri);
    this.addMapping(NS_DCTERM('date'), 'date');
    this.addMapping(NS_SOLIDRC('model'), 'model', PropertyType.Uri);
    this.addMapping(NS_DCTERM('location'), 'location', PropertyType.Uri);
    this.addMapping(NS_SOLIDRC('duration'), 'duration');
    this.addDerivedMapping(NS_DCTERM('location'), NS_DCTERM('title'), 'locationName');
    this.addDerivedMapping(NS_SOLIDRC('model'), NS_DCTERM('title'), 'modelName');
    this.addDerivedMapping(NS_SOLIDRC('model'), NS_SOLIDRC('image'), 'modelImage', PropertyType.Uri);
    this.addDerivedMapping(NS_SOLIDRC('model'), NS_SOLIDRC('thumbnail'), 'modelThumbnail', PropertyType.Uri);

    // Load *all* the logbook entries into the store
    await this.fetcher.load(LogbookRepository.EntriesUrl).catch(err => console.debug(err));
  }


  /**
   * Get a list of all logbook entries as simple javascript objects.
   */
  async getEntries()
  {    
    // Find the subjects of all logbook entries (from statements having type = 'logentry')
    let entries = this.store.match(null, NS_RDF('type'), NS_SOLIDRC('logentry'));

    // Build a list of all logbook entries by fetching the logbook entry data from each entry URL (subject).
    let result = Promise.all(entries.map(e => this.readEntryFromUrl(e.subject)));

    return result; 
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
    let entryUrl = this.store.sym(LogbookRepository.LogBookUrl + entryName);

    // Make properties strongly typed for RDFLIB and add extra statements
    entry.date = new moment(entry.date, 'YYYY-MM-DD').toDate();
    entry.created = new Date();
    // FIXME: read from current login
    entry.creator = 'https://elfisk.solid.community/profile/card#me';

    this.storeObject(entryUrl, entry);
  }


  async deleteEntry(entry)
  {
    await this.deleteObject(entry.id);
  }


  generateEntryName(date)
  {
    const timestamp = Math.floor(Date.now() / 1000);
    return 'entry-' + timestamp;
  }
}


LogbookRepository.LogBookUrl = 'https://elfisk.solid.community/public/solidrc/logbook/';
LogbookRepository.EntriesUrl = 'https://elfisk.solid.community/public/solidrc/logbook/entry-*';
