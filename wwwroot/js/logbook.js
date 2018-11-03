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
    methods:
    {
      addNewEntry : function()
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
      },

      deleteEntry : function(entry)
      {
        logRepo.deleteEntry(entry);
        this.refresh();
      },

      refresh : function()
      {
        this.logEntries = [];
        let entries = logRepo.getEntries();
        this.logEntries = entries;
      }
    }
  });

  $('.date-input').datepicker(
    {
      format: 'yyyy-mm-dd',
      xxxstartDate: '',
      autoclose: true
    }
  );

});