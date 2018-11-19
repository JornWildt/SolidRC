/** Models repository with CRUD methods for models.
 */
class ModelRepository extends ORDFMapper
{
  constructor()
  {
    super();

    this.imageRepo = new ImageRepository(ModelRepository.ImageUrl);
  }

  
  async initialize()
  {
    // Assign RDF type for objects managed by this repository
    this.setObjectType(NS_SOLIDRC('model'));

    // Map statement predicate/objects into simple javascript key/values.
    this.addMapping(NS_SCHEMA('dateCreated'), 'created');
    this.addMapping(NS_SCHEMA('author'), 'creator', PropertyType.Uri);
    this.addMapping(NS_SCHEMA('image'), 'image', PropertyType.Uri);
    this.addMapping(NS_SCHEMA('thumbnail'), 'thumbnail', PropertyType.Uri);
    this.addMapping(NS_SCHEMA('name'), 'name');

    // Load *all* the models into the store
    return this.loadAllContainerItems(ModelRepository.ModelsUrl);
  }


  /**
   * Get a list of all models as simple javascript objects from the local store.
   */
  async getModels()
  {    
    // Find the subjects of all models (from statements having type = 'model')
    let models = this.store.match(null, NS_RDF('type'), NS_SOLIDRC('model'));

    // Build a list of all models by fetching the model data from the model's URL (subject)
    let result = await Promise.all(models.map(m => this.readModelFromUrl(m.subject)));

    // Make sure we always get a consistent sort order
    result.sort((a,b) => (a.name ? a.name.localeCompare(b.name) : 0));

    return result; 
  }


  /**
   * Read a single model from its URL, assuming it has already been loaded into the store.
   */
  async readModelFromUrl(url)
  {
    return this.readObject(url);
  }


  /**
   * Add a new model and associated images.
   */
  async addModel(model)
  {
    // Store associated image and get it's URL
    let imageP = this.imageRepo.addImage(model.image, model.name)
                 .then(url => model.image = url)
                 .catch(err => console.warn(err));

    // Store associated image thumbnail and get it's URL
    let thumbnailP = this.imageRepo.addImage(model.thumbnail, model.name + '-tmb')
                     .then(url => model.thumbnail = url)
                     .catch(err => console.warn(err));

    await Promise.all([imageP, thumbnailP]);

    // Generate a unique URL name (path element) for the model
    let modelName = this.generateModelName(model.name);

    // Combine modelName with base URL to get complete URL for new model
    let modelUrl = this.store.sym(ModelRepository.ModelUrl + modelName);

    // Make properties strongly typed for RDFLIB and add extra statements
    model.created = new Date();
    // FIXME: read from current login
    model.creator = 'https://elfisk.solid.community/profile/card#me';

    return this.storeObject(modelUrl, model).catch(err => console.warn(err));
  }


  /**
   * Update an existing model.
   * @param {object} model 
   */
  async updateModel(model)
  {
    let imageP = null;
    let thumbnailP = null;

    // Update associated image if given
    if (model.imageFile)
    {
      imageP = this.imageRepo.updateImage(model.imageFile, model.image)
               .catch(err => console.warn(err));
    }

    // Update associated image thumbnail if given
    if (model.thumbnailFile)
    {
      thumbnailP = this.imageRepo.updateImage(model.thumbnailFile, model.thumbnail)
                   .catch(err => console.warn(err));
    }

    await Promise.all([imageP, thumbnailP]);

    return this.updateObject(model.id, model);
  }


  async deleteModel(model)
  {
    // Run all requests in parallel - catch errors for each one to avoid "fail fast" behavior of Promise.All()
    await Promise.all(
    [
      this.deleteObject(model.id).catch(err => console.debug(err)),
      model.image ? this.imageRepo.deleteImage(model.image).catch(err => console.debug(err)) : null,
      model.thumbnail ? this.imageRepo.deleteImage(model.thumbnail).catch(err => console.debug(err)) : null
    ]);
  }


  generateModelName(name)
  {
    name = this.generateValidUrlName(name).toLowerCase();
    return name;
  }
}


ModelRepository.ModelUrl = 'https://elfisk.solid.community/public/solidrc/models/';
ModelRepository.ModelsUrl = 'https://elfisk.solid.community/public/solidrc/models/*';
ModelRepository.ImageUrl = 'https://elfisk.solid.community/public/solidrc/images/';