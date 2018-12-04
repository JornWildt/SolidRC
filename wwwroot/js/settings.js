$(async function()
{
  var locationsApp = new Vue({
    el: '#settingsApp',
    data: {
      loading: true,
      webId: "",
      storageRoot: "",
      storageRootCopy: "",
      isEditingStorageRoot: false,
      logbookStorage: "",
      modelStorage: "",
      modelImageStorage: "",
      locationStorage: ""
    },
    async mounted() {
      let profileService = ProfileService.instance;
      let locationRepo = new LocationRepository();
      let modelRepo = new ModelRepository();
      let logRepo = new LogbookRepository();

      await profileService.initialize().catch(err => console.warn(err));

      await Promise.all([
        locationRepo.initialize('none').catch(err => console.warn(err)),
        modelRepo.initialize('none').catch(err => console.warn(err)),
        logRepo.initialize('none').catch(err => console.warn(err))
      ]);
    
      this.storageRoot = await profileService.getLocationForType(NS_SOLIDRC('data'), 'user/rc-data/');

      this.webId = profileService.profile.webId;
      this.logbookStorage = logRepo.entryUrl;
      this.modelStorage = modelRepo.modelUrl;
      this.modelImageStorage = modelRepo.imageUrl;
      this.locationStorage = locationRepo.locationUrl;
      this.loading = false;
    },
    methods: $.extend({}, ViewModelBase, 
    {
      editStorageRoot : function()
      {
        this.storageRootCopy = this.storageRoot;
        this.isEditingStorageRoot = true;
      },

      editStorageRootSave : function()
      {
        this.isEditingStorageRoot = false;
      },

      editStorageRootCancel : function()
      {
        this.storageRoot = this.storageRootCopy;
        this.isEditingStorageRoot = false;
      }
    })
  });
});