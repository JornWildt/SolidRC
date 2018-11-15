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

      editLocation : function(location)
      {
        this.formTitle = "Edit location";
        this.formState = 'edit';
        this.locationName = location.name;
        this.useExternalUrl = location.url != null;
        this.externalUrl = location.url;
        $('#addLocationDialog').modal();
      },

      saveLocation : async function()
      {

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

  // $('.date-input').datepicker(
  //   {
  //     format: 'yyyy-mm-dd',
  //     autoclose: true
  //   }
  // );
});