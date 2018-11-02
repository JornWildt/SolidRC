$(async function()
{
  let logRepo = new LogbookRepository();
  await logRepo.initialize();

  let logEntries = logRepo.getEntries();

  var logbookViewModel = new Vue({
    el: '#logbook',
    data: {
      selectedModel: null,
      selectedDate: null,
      selectedLocation: null,
      selectedDuration: null,
      logEntries: logEntries
    },
    mounted() {
      $("#selectedDate").datepicker({
        format: 'yyyy-mm-dd',
        startDate: '0d',
        autoclose: true
      }).on("changeDate", () => {this.selectedDate = $('#selectedDate').val()})
    },
    methods:
    {
      addNewEntry : function()
      {
        logRepo.addEntry(this.selectedDate, this.selectedModel, this.selectedLocation, this.selectedDuration);

        this.refresh();
        //this.logEntries.push({ id:2, date: this.selectedDate, model: this.selectedModel, location: this.selectedLocation, duration: '3:22' });
        $('#addEntryDialog').modal('hide');
      },

      refresh : function()
      {
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