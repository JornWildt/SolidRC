Vue.use(vuelidate.default);

$(async function()
{
  
  let locationRepo = new LocationRepository();
  let modelRepo = new ModelRepository();
  let logRepo = new LogbookRepository();

  let p1 = locationRepo.initialize();
  let p2 = modelRepo.initialize();
  let p3 = logRepo.initialize();
  await Promise.all([p1,p2,p3]);

  var logbookApp = new Vue({
    el: '#logbook',
    data: {
      formTitle: null,
      formState: null,
      models: [],
      locations: [],
      selectedModel: null,
      selectedDate: new moment().format('YYYY-MM-DD'),
      selectedLocation: "",
      selectedDuration: "",
      currentEntry: null,
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
      await this.refresh();

      // Touch all vuelidation inputs to trigger validation (and disabling the "Add" button before everything is valid)
      this.$v.$touch();

      // Setup the date input
      $("#selectedDate").datepicker({
        format: 'yyyy-mm-dd',
        autoclose: true
      }).on("changeDate", () => {this.selectedDate = $('#selectedDate').val(); });

      // Activate tooltips
      $('[data-toggle="tooltip"]').tooltip()
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
      editNewEntry : function()
      {
        this.formTitle = "Add model";
        this.formState = 'add';
        this.selectedDate = new moment().format('YYYY-MM-DD');
        this.selectedModel =  this.models[0].id;
        this.selectedLocation = this.locations[0].id;
        this.selectedDuration = "";
        $('#entryDialog').modal('show');
      },

      addEntry : async function()
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

          await this.refresh();

          $('#entryDialog').modal('hide');
        }
      },

      editEntry : function(entry)
      {
        DebugJson(entry);
        this.currentEntry = entry;
        this.formTitle = "Edit entry";
        this.formState = 'edit';
        this.selectedDate = entry.date
        this.selectedModel =  entry.model;
        this.selectedLocation = entry.location;
        this.selectedDuration = entry.duration;
        $('#entryDialog').modal('show');
      },

      saveEntry : async function()
      {
        if (!this.$v.$invalid)
        {
          this.currentEntry.date = this.selectedDate;
          this.currentEntry.model = this.selectedModel;
          this.currentEntry.location = this.selectedLocation;
          this.currentEntry.duration = this.selectedDuration;
          await logRepo.updateEntry(this.currentEntry);
          await this.refresh();
          $('#entryDialog').modal('hide');
        }
      },

      deleteEntry : async function(entry)
      {
        if (confirm('Delete entry?'))
        {
          await logRepo.deleteEntry(entry);
          await this.refresh();
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