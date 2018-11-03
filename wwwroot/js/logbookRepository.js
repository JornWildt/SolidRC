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
    // Map statement predicate/objects into simple javascript key/values.
    const entryMap = {};
    entryMap[NS_DCTERM('date').value] = 'date';
    entryMap[NS_SOLIDRC('model').value] = 'model';
    entryMap[NS_DCTERM('location').value] = 'location';
    entryMap[NS_SOLIDRC('duration').value] = 'duration';
    this.initializeMappings(entryMap);

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
    // Find the subjects of all logbook entries (from statements with type 'logentry')
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
    console.debug("Read entry from : " + url);

    // Find all statements having  the logbook URL as the subject.
    let values = this.store.match(url, null, null);

    // Copy object values from all the statements into a simple javascript object.
    // - Use base GenericRepository utility function for this.
    let result = this.copyPredicatesIntoObject(values);

    // Assign ID to the result (since it is not the object in any of the statements)
    result.id = url;

    return result;
  }


  /**
   * Add a new logbook entry
   * 
   * @param {date} date Date of flight.
   * @param {URL} model Reference to associated model.
   * @param {URL} location Reference to associated location.
   * @param {timespan} duration Duration of flight.
   */
  addEntry(entry)
  {
    // Generate a unique URL name (path element) for the entry
    let entryName = generateEntryName(entry.date);

    // Combine entryName with base URL to get complete URL for new entry
    let entryUrl = this.store.sym(LogbookRepository.LogBookUrl + entryName);

    // Add statements to the local store for each relevant value of the entry
    this.store.add(entryUrl, NS_RDF('type'), NS_SOLIDRC('logentry'), entryUrl);
    this.store.add(entryUrl, NS_DCTERM('created'), new Date(), entryUrl);
    // FIXME: read from current login
    this.store.add(entryUrl, NS_DCTERM('creator'), this.store.sym('https://elfisk.solid.community/profile/card#me'), entryUrl);

    // Modify string baseduser input from browser to strong types and RDF links
    entry.location = this.store.sym(entry.location);
    entry.model = this.store.sym(entry.model);
    entry.date = new moment(entry.date, 'YYYY-MM-DD').toDate();

    // Use supplied mapping to copy the remaining properties
    this.copyPropertiesIntoStatements(entryUrl, entry);

    // Put the new statements onto the web
    this.fetcher.putBack(entryUrl);
  }


  deleteEntry(entry)
  {
    // FIXME: error handling

    let doc
    this.fetcher.delete(entry.id);
    this.store.removeDocument(this.store.sym(entry.id));
  }
}


function generateEntryName(date)
{
  const timestamp = Math.floor(Date.now() / 1000);
  return 'entry-' + timestamp;
}


LogbookRepository.LogBookUrl = 'https://elfisk.solid.community/public/solidrc/logbook/';
LogbookRepository.EntriesUrl = 'https://elfisk.solid.community/public/solidrc/logbook/entry-*';
