$(async function()
{
  let profileService = new ProfileService();
  await profileService.initialize();

  var locationsApp = new Vue({
    el: '#settingsApp',
    data: {
      webId: "X",
      dataLocation: "Y"
    },
    async mounted() {
      this.webId = profileService.profile.webId;
      this.dataLocation = profileService.rcStorageRoot;
    },
    methods: $.extend({}, ViewModelBase, 
    {
    })
  });
});