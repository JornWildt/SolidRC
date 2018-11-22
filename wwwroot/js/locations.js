Vue.use(vuelidate.default);

$(async function()
{
  let locationRepo = new LocationRepository();
  await locationRepo.initialize();

  var locationsApp = new Vue({
    el: '#locationsApp',
    data: {
      formState: 'add',
      formTitle: "",
      currentLocation: null,
      locationName: "",
      useExternalUrl: false,
      externalUrl: "",
      locations: []
    },
    async mounted() {
      // Refresh (fetch) the locations for the list
      await this.refresh();
      
      // Touch all vuelidation inputs to trigger validation (and disabling the "Add" button before everything is valid)
      this.$v.$touch();
    },
    validations: {
      locationName: {
        required: validators.required
      },
      externalUrl: {
        url: validators.url
      }
    },
    methods: $.extend({}, ViewModelBase, 
    {
      editNewLocation : function()
      {
        this.formTitle = "Add location";
        this.formState = 'add';
        this.currentLocation = null;
        this.locationName = '';
        this.useExternalUrl = false;
        this.externalUrl = null;
        $('#locationDialog').modal('show');
      },

      addLocation : function()
      {
        if (!this.$v.$invalid)
        {
          locationRepo.addLocation(
            {
              name: this.locationName,
              externalUrl : (this.useExternalUrl ? this.externalUrl : null)
            });

          this.refresh();

          $('#locationDialog').modal('hide');
        }
      },

      editLocation : function(location)
      {
        this.currentLocation = location;
        this.formTitle = "Edit location";
        this.formState = 'edit';
        this.locationName = location.name;
        this.useExternalUrl = location.useExternalUrl;
        this.externalUrl = location.externalUrl;
        $('#locationDialog').modal('show');
      },

      saveLocation : async function()
      {
        if (!this.$v.$invalid)
        {
          this.currentLocation.name = this.locationName;
          this.currentLocation.externalUrl = this.externalUrl;
          this.currentLocation.useExternalUrl = this.useExternalUrl ? true : false; // Convert to real bool
          await locationRepo.updateLocation(this.currentLocation);
          await this.refresh();
          $('#locationDialog').modal('hide');
        }
      },

      deleteLocation : async function(location)
      {
        if (confirm('Delete location?'))
        {
          await locationRepo.deleteLocation(location);
          await this.refresh();
        }
      },

      refresh : async function()
      {
        let locations = await locationRepo.getLocations();
        this.locations = locations;
      }
    })
  });
});