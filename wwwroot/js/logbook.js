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
      loading: true,
      formTitle: null,
      formState: null,
      processing: false,
      currentEntry: null,
      models: [],
      locations: [],
      canAddEntry: true,
      selectedModel: null,
      selectedDate: new moment().format('YYYY-MM-DD'),
      selectedLocation: "",
      selectedDuration: "",
      selectedComment: "",
      logEntries: []
    },
    async mounted() {
      // Get the list of models for the "Models" dropdown box
      let mp = modelRepo.getModels()
        .then(models =>
        {
          this.models = models;
          if (this.models.length > 0)
            this.selectedModel = this.models[0].id;
        });
        
      // Get the list of locations for the "Locations" dropdown box
      let lp = locationRepo.getLocations()
        .then(locations =>
        {
          this.locations = locations;
          if (this.locations.length > 0)
            this.selectedLocation = this.locations[0].url;
        });

      // Refresh (fetch) the log entries for the list
      let rp = this.refresh();

      // Wait for the previous operations to complete in parallel
      await Promise.all([mp,lp,rp]);

      if (this.models.length == 0 || this.locations.length == 0)
        this.canAddEntry = false;

      // Touch all vuelidation inputs to trigger validation (and disabling the "Add" button before everything is valid)
      this.$v.$touch();

      // Setup the date input
      $("#selectedDate").datepicker({
        format: 'yyyy-mm-dd',
        autoclose: true
      }).on("changeDate", () => {this.selectedDate = $('#selectedDate').val(); });

      // Activate tooltips
      $('[data-toggle="tooltip"]').tooltip()

      // Show entries now that everything is loaded
      this.loading = false;
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
        this.currentEntry = null;
        this.selectedDate = new moment().format('YYYY-MM-DD');
        this.selectedModel =  this.models.length > 0 ? this.models[0].id : null;
        this.selectedLocation = this.locations.length > 0 ? this.locations[0].id : null;
        this.selectedDuration = "";
        this.selectedComment = "";
        this.showSelectedModel();
        $('#entryDialog').modal('show');
      },

      addEntry : async function()
      {
        if (!this.$v.$invalid)
        {
          this.processing = true;
          await logRepo.addEntry(
            {
              date: this.selectedDate, 
              model: this.selectedModel, 
              location: this.selectedLocation, 
              duration: this.selectedDuration,
              comment: this.selectedComment
            });

          await this.refresh();

          this.processing = false;
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
        this.selectedComment = entry.comment;
        this.showSelectedModel();
        $('#entryDialog').modal('show');
      },

      saveEntry : async function()
      {
        if (!this.$v.$invalid)
        {
          this.processing = true;
          this.currentEntry.date = this.selectedDate;
          this.currentEntry.model = this.selectedModel;
          this.currentEntry.location = this.selectedLocation;
          this.currentEntry.duration = this.selectedDuration;
          this.currentEntry.comment = this.selectedComment;
          await logRepo.updateEntry(this.currentEntry);
          await this.refresh();
          $('#entryDialog').modal('hide');
          this.processing = false;
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
        let entries = await logRepo.getEntries(0, 3);
        this.logEntries = entries;
      },

      handleModelChanged : function()
      {
        this.showSelectedModel();
      },

      showSelectedModel : function()
      {
        let model = this.models.find(m => m.id == this.selectedModel);
        let img = document.getElementById("modelThumbnail");
        if (model && model.thumbnail)
        {
          img.src = model.thumbnail;
          img.title = model.name;
          img.alt = model.name;
        }
        else
        {
          img.src = "";
          img.title = "";
          img.alt = "";
        }
      }
    })
  });
});