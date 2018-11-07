Vue.use(vuelidate.default);

$(async function()
{
  
  let logRepo = new LogbookRepository();
  let modelRepo = new ModelRepository();

  await logRepo.initialize();
  await modelRepo.initialize();  

  var logbookApp = new Vue({
    el: '#logbook',
    data: {
      models: [],
      selectedModel: null,
      selectedDate: new moment().format('YYYY-MM-DD'),
      selectedLocation: "http://blah.blah/kildedal",
      selectedDuration: "",
      logEntries: []
    },
    mounted() {
      this.models = modelRepo.getModels();
      if (this.models.length > 0)
        this.selectedModel = this.models[0].id;
      this.refresh();
      this.$v.$touch();
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

      refresh : function()
      {
        let entries = logRepo.getEntries();
        this.logEntries = entries;
      }
    })
  });
});