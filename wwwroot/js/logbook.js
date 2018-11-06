Vue.use(window.vuelidate.default);
const { required, minLength } = window.validators;


const dateValidator = (value) => new moment(value, 'YYYY-MM-DD').isValid();
const timespanValidator = (value) => /^(\d+:)?(\d{1,2}:)?(\d{1,2})?$/.test(value);

$(async function()
{
  
  let logRepo = new LogbookRepository();
  await logRepo.initialize();

  var logbookViewModel = new Vue({
    el: '#logbook',
    data: {
      selectedModel: "http://blah.blah/chipmunk",
      selectedDate: new moment().format('YYYY-MM-DD'),
      selectedLocation: "http://blah.blah/kildedal",
      selectedDuration: "5:00",
      logEntries: []
    },
    mounted() {
      this.refresh();
      $("#selectedDate").datepicker({
        format: 'yyyy-mm-dd',
        autoclose: true
      }).on("changeDate", () => {this.selectedDate = $('#selectedDate').val(); });
    },
    validations: {
      selectedDate: {
        required,
        dateValidator
      },
      selectedDuration: {
        timespanValidator
      }
    },
    methods:
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

      status(v) {
        return {
          error: v.$error,
          dirty: v.$dirty
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
    }
  });
});