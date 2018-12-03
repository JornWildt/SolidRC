$(async function()
{
  var locationsApp = new Vue({
    el: '#settingsApp',
    data: {
      loading: true,
      webId: "",
      logbookStorage: "",
      modelStorage: "",
      modelImageStorage: "",
      locationStorage: ""
    },
    async mounted() {
      let profileService = new ProfileService();
      let locationRepo = new LocationRepository();
      let modelRepo = new ModelRepository();
      let logRepo = new LogbookRepository();

      await Promise.all([
        profileService.initialize('none').catch(err => console.warn(err)),
        locationRepo.initialize('none').catch(err => console.warn(err)),
        modelRepo.initialize('none').catch(err => console.warn(err)),
        logRepo.initialize('none').catch(err => console.warn(err))
      ]);
    
      this.webId = profileService.profile.webId;
      this.logbookStorage = logRepo.entryUrl;
      this.modelStorage = modelRepo.modelUrl;
      this.modelImageStorage = modelRepo.imageUrl;
      this.locationStorage = locationRepo.locationUrl;
      this.loading = false;
    },
    methods: $.extend({}, ViewModelBase, 
    {
    })
  });
});