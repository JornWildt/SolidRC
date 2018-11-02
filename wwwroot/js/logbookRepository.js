class LogbookRepository
{
  constructor()
  {
    this.store = $rdf.graph();
    this.fetcher = new $rdf.Fetcher(this.store);
    this.updater = new $rdf.UpdateManager(this.store);
  }

  
  async initialize()
  {
    // Load the logbook into the store
    try
    {
      //await this.fetcher.load(LogbookRepository.logBookUrl + 'entry-*');
    }
    catch (err)
    {
      console.log(err);
    }
  }


  getEntries()
  {    
    //let entries = this.store.each($rdf.sym(LogbookRepository.logBookUrl), 'knows');

    let result =
    [
      { id:0, date: '2018-10-29', model: 'Mosquito B.IV 1:10', location: 'RC Parken', duration: '6:05' },
      { id:1, date: '2018-10-20', model: 'Chipmunk', location: 'Kildedal', duration: '4:05' },
      { id:2, date: '2018-08-17', model: 'Chipmunk', location: 'Kildedal', duration: '5:22' }
    ];

    return result; 
  }


  addEntry(date, model, location)
  {
    let store = $rdf.graph();
    let fetcher = new $rdf.Fetcher(store);

    let entryName = generateEntryName(date);
    let entryUrl = store.sym(LogbookRepository.logBookUrl + entryName);

    store.add(entryUrl, NS_RDF('type'), NS_SOLIDRC('logentry'), entryUrl);
    store.add(entryUrl, NS_DCTERM('created'), date, entryUrl);
    // FIXME: read from current login
    store.add(entryUrl, NS_DCTERM('creator'), store.sym('https://elfisk.solid.community/profile/card#me'), entryUrl);
    store.add(entryUrl, NS_DCTERM('date'), date, entryUrl);
    store.add(entryUrl, NS_SOLIDRC('model'), model, entryUrl);
    store.add(entryUrl, NS_DCTERM('location'), location, entryUrl);

    fetcher.putBack(entryUrl);
  }
}


function generateEntryName(date)
{
  const timestamp = Math.floor(Date.now() / 1000);
  return 'entry-' + timestamp;
}


LogbookRepository.logBookUrl = 'https://elfisk.solid.community/public/solidrc/logbook/';
