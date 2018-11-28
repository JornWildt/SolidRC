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
      this.profileService = new ProfileService();
      await this.profileService.initialize();
    
      this.webId = this.profileService.profile.webId;
      this.logbookStorage = this.profileService.profile.storage + LogbookStoragePath;
      this.modelStorage = this.profileService.profile.storage + ModelStoragePath;
      this.modelImageStorage = this.profileService.profile.storage + ModelImageStoragePath;
      this.locationStorage = this.profileService.profile.storage + LocationStoragePath;
      this.loading = false;
    },
    methods: $.extend({}, ViewModelBase, 
    {
    })
  });
});