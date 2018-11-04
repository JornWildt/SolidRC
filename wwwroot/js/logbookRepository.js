/** Logbook repository with CRUD methods for logbook entries.
 */
class LogbookRepository extends GenericRepository
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

    // Load *all* the logbook entries into the store
    try
    {
      await this.fetcher.load(LogbookRepository.EntriesUrl);
    }
    catch (err)
    {
      // FIXME: improved error handling should be applied here!
      console.log(err);
    }
  }


  /**
   * Get a list of all logbook entries as simple javascript objects.
   */
  getEntries()
  {    
    // Find the subjects of all logbook entries (from statements having type = 'logentry')
    let entries = this.store.match(null, NS_RDF('type'), NS_SOLIDRC('logentry'));

    // Build a list of all logbook entries by fetching the logbook entry data from the entry URL (subject)
    let result = entries.map(q => this.readEntryFromUrl(q.subject));

    return result; 
  }


  /**
   * Read a single logbook entry from its URL, assuming it has already been loaded into the store.
   */
  readEntryFromUrl(url)
  {
    var entry = this.readObject(url);
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


  deleteEntry(entry)
  {
    // FIXME: error handling
    this.deleteObject(entry.id);
  }


  generateEntryName(date)
  {
    const timestamp = Math.floor(Date.now() / 1000);
    return 'entry-' + timestamp;
  }
}


LogbookRepository.LogBookUrl = 'https://elfisk.solid.community/public/solidrc/logbook/';
LogbookRepository.EntriesUrl = 'https://elfisk.solid.community/public/solidrc/logbook/entry-*';
