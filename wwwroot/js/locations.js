Vue.use(vuelidate.default);

$(async function()
{
  let locationRepo = new LocationRepository();
  await locationRepo.initialize();

  var locationsApp = new Vue({
    el: '#locationsApp',
    data: {
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
      addNewLocation : function()
      {
        if (!this.$v.$invalid)
        {
          locationRepo.addLocation(
            {
              name: this.locationName,
              url : (this.useExternalUrl ? this.externalUrl : null)
            });

          this.refresh();

          $('#addLocationDialog').modal('hide');
        }
      },

      deleteLocation : function(location)
      {
        if (confirm('Delete location?'))
        {
          locationRepo.deleteLocation(location);
          this.refresh();
        }
      },

      refresh : async function()
      {
        let locations = await locationRepo.getLocations();
        this.locations = locations;
      }
    })
  });

  // $('.date-input').datepicker(
  //   {
  //     format: 'yyyy-mm-dd',
  //     autoclose: true
  //   }
  // );
});