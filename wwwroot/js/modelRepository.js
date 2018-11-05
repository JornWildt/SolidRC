/** Models repository with CRUD methods for models.
 */
class ModelRepository extends ORDFMapper
{
  constructor()
  {
    super();
  }

  
  async initialize()
  {
    // Assign RDF type for objects managed by this repository
    this.setObjectType(NS_SOLIDRC('model'));

    // Map statement predicate/objects into simple javascript key/values.
    this.addMapping(NS_DCTERM('created'), 'created');
    this.addMapping(NS_DCTERM('creator'), 'creator', PropertyType.Uri);
    this.addMapping(NS_DCTERM('title'), 'name');

    // Load *all* the models into the store
    try
    {
      await this.fetcher.load(ModelRepository.ModelsUrl);
    }
    catch (err)
    {
      // FIXME: improved error handling should be applied here!
      console.log(err);
    }
  }


  /**
   * Get a list of all models as simple javascript objects.
   */
  getModels()
  {    
    // Find the subjects of all models (from statements having type = 'model')
    let models = this.store.match(null, NS_RDF('type'), NS_SOLIDRC('model'));

    // Build a list of all models by fetching the model data from the models URL (subject)
    let result = models.map(m => this.readModelFromUrl(m.subject));

    return result; 
  }


  /**
   * Read a single model from its URL, assuming it has already been loaded into the store.
   */
  readModelFromUrl(url)
  {
    var model = this.readObject(url);
    return model;
  }


  /**
   * Add a new model
   */
  addModel(model)
  {
    // Generate a unique URL name (path element) for the model
    let modelName = this.generateModelName(model.name);

    // Combine modelName with base URL to get complete URL for new model
    let modelUrl = this.store.sym(ModelRepository.ModelUrl + modelName);

    // Make properties strongly typed for RDFLIB and add extra statements
    //model.date = new moment(model.date, 'YYYY-MM-DD').toDate();
    model.created = new Date();
    // FIXME: read from current login
    model.creator = 'https://elfisk.solid.community/profile/card#me';

    this.storeObject(modelUrl, model);
  }


  deleteModel(model)
  {
    // FIXME: error handling
    this.deleteObject(model.id);
  }


  generateModelName(name)
  {
    const timestamp = Math.floor(Date.now() / 1000);
    return name + '-' + timestamp;
  }
}


ModelRepository.ModelUrl = 'https://elfisk.solid.community/public/solidrc/models/';
ModelRepository.ModelsUrl = 'https://elfisk.solid.community/public/solidrc/models/*';
