Vue.use(vuelidate.default);

$(async function()
{
  let locationRepo = new LocationRepository();
  await locationRepo.initialize();

  var locationsApp = new Vue({
    el: '#locationsApp',
    data: {
      locationName: "",
      locations: []
    },
    mounted() {
      // Refresh (fetch) the locations for the list
      this.refresh();
      
      // Touch all vuelidation inputs to trigger validation (and disabling the "Add" button before everything is valid)
      this.$v.$touch();
    },
    validations: {
      locationName: {
        required: validators.required
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
              name: this.locationName
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

      refresh : function()
      {
        let locations = locationRepo.getLocations();
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