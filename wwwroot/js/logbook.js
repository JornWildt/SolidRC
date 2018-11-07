Vue.use(vuelidate.default);

$(async function()
{
  
  let locationRepo = new LocationRepository();
  let modelRepo = new ModelRepository();
  let logRepo = new LogbookRepository();

  await locationRepo.initialize();  
  await modelRepo.initialize();  
  await logRepo.initialize();

  var logbookApp = new Vue({
    el: '#logbook',
    data: {
      models: [],
      locations: [],
      selectedModel: null,
      selectedDate: new moment().format('YYYY-MM-DD'),
      selectedLocation: "http://blah.blah/kildedal",
      selectedDuration: "",
      logEntries: []
    },
    async mounted() {
      // Get the list of models for the "Models" dropdown box
      this.models = await modelRepo.getModels();
      if (this.models.length > 0)
        this.selectedModel = this.models[0].id;
        
      // Get the list of locations for the "Locations" dropdown box
      this.locations = await locationRepo.getLocations();
      if (this.locations.length > 0)
        this.selectedLocation = this.locations[0].url;

      // Refresh (fetch) the log entries for the list
      this.refresh();

      // Touch all vuelidation inputs to trigger validation (and disabling the "Add" button before everything is valid)
      this.$v.$touch();

      // Setup the date input
      $("#selectedDate").datepicker({
        format: 'yyyy-mm-dd',
        autoclose: true
      }).on("changeDate", () => {this.selectedDate = $('#selectedDate').val(); });
    },
    validations: {
      selectedDate: {
        required: validators.required,
        dateValidator
      },
      selectedDuration: {
        timespanValidator
      }
    },
    methods: $.extend({}, ViewModelBase, 
    {
      addNewEntry : function()
      {
        if (!this.$v.$invalid)
        {
          logRepo.addEntry(
            {
              date: this.selectedDate, 
              model: this.selectedModel, 
              location: this.selectedLocation, 
              duration: this.selectedDuration
            });

          this.refresh();

          $('#addEntryDialog').modal('hide');
        }
      },

      deleteEntry : function(entry)
      {
        if (confirm('Delete entry?'))
        {
          logRepo.deleteEntry(entry);
          this.refresh();
        }
      },

      refresh : async function()
      {
        let entries = await logRepo.getEntries();
        this.logEntries = entries;
      }
    })
  });
});