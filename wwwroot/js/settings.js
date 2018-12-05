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
      this.profileService = ProfileService.instance;
      this.locationRepo = new LocationRepository();
      this.modelRepo = new ModelRepository();
      this.logRepo = new LogbookRepository();

      await Promise.all([
        this.profileService.initialize().catch(err => console.warn(err)),
        this.locationRepo.initialize('none').catch(err => console.warn(err)),
        this.modelRepo.initialize('none').catch(err => console.warn(err)),
        this.logRepo.initialize('none').catch(err => console.warn(err))
      ]);

      this.refresh();

      this.loading = false;
    },
    methods: $.extend({}, ViewModelBase, 
    {
      editStorageRoot : function()
      {
        this.storageRootCopy = this.storageRoot;
        this.isEditingStorageRoot = true;
        this.$nextTick(() => $('#storageRoot').select());
      },

      editStorageRootSave : async function()
      {
        this.isEditingStorageRoot = false;
        if (!this.storageRoot.endsWith('/'))
          this.storageRoot = this.storageRoot + '/';
        await this.profileService.updateLocationForType(NS_SOLIDRC('data'), this.storageRoot);
        window.location.reload();
      },

      editStorageRootCancel : function()
      {
        this.storageRoot = this.storageRootCopy;
        this.isEditingStorageRoot = false;
      },

      refresh : async function()
      {    
        this.storageRoot = await this.profileService.getLocationForType(NS_SOLIDRC('data'), 'user/rc-data/');

        this.webId = this.profileService.profile.webId;
        this.logbookStorage = this.logRepo.entryUrl;
        this.modelStorage = this.modelRepo.modelUrl;
        this.modelImageStorage = this.modelRepo.imageUrl;
        this.locationStorage = this.locationRepo.locationUrl;  
      }
    })
  });
});