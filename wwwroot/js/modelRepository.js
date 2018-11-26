/** Models repository with CRUD methods for models.
 */
class ModelRepository extends ORDFMapper
{
  constructor()
  {
    super();
    this.profileService = new ProfileService();
  }

  
  async initialize()
  {
    // Assign RDF type for objects managed by this repository
    this.setObjectType(NS_SOLIDRC('model'));

    // Map statement predicate/objects into simple javascript key/values.
    this.addMapping(NS_SCHEMA('dateCreated'), 'created', PropertyType.Raw, false);
    this.addMapping(NS_SCHEMA('author'), 'creator', PropertyType.Uri, false);
    this.addMapping(NS_SCHEMA('image'), 'image', PropertyType.Uri, true);
    this.addMapping(NS_SCHEMA('thumbnail'), 'thumbnail', PropertyType.Uri, true);
    this.addMapping(NS_SCHEMA('name'), 'name', PropertyType.Raw, true);

    await this.profileService.initialize();

    this.containerUrl = this.profileService.rcStorageRoot + "models/*";
    this.modelUrl = this.profileService.rcStorageRoot + "models/";
    this.imageUrl = this.profileService.rcStorageRoot + "images/";

    this.imageRepo = new ImageRepository(this.imageUrl);

    // Load *all* the models into the store
    return this.loadAllContainerItems(this.containerUrl);
  }


  /**
   * Get a list of all models as simple javascript objects from the local store.
   */
  async getModels()
  {    
    // Find the subjects of all models (from statements having type = 'model')
    let models = this.store.match(null, NS_RDF('type'), NS_SOLIDRC('model'));

    // Build a list of all models by fetching the model data from the model's URL (subject)
    let result = await Promise.all(models.map(m => this.readModelFromUrl(m.subject).catch(err => console.warn(err))));

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
    if (model.imageFile)
      await this.createImages(model);

    // Generate a unique URL name (path element) for the model
    let modelName = this.generateModelName(model.name);

    // Combine modelName with base URL to get complete URL for new model
    let modelUrl = this.store.sym(this.modelUrl + modelName);

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
    if (model.image)
      await this.updateImages(model);
    else
      await this.createImages(model);

    return this.updateObject(model.id, model);
  }


  async createImages(model)
  {
    // Store associated image and get it's URL
    let imageP = this.imageRepo.addImage(model.imageFile, model.name)
                 .then(url => model.image = url)
                 .catch(err => console.warn(err));

    // Store associated image thumbnail and get it's URL
    let thumbnailP = this.imageRepo.addImage(model.thumbnailFile, model.name + '-tmb')
                     .then(url => model.thumbnail = url)
                     .catch(err => console.warn(err));

    return Promise.all([imageP, thumbnailP]);
  }


  async updateImages(model)
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

    return Promise.all([imageP, thumbnailP]);
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


ModelRepository.ImageUrl = 'https://elfisk.solid.community/public/solidrc/images/';