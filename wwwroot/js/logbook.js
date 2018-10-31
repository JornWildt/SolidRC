$(function()
{
  var logbookViewModel = new Vue({
    el: '#logbook',
    data: {
      selectedModel: null,
      selectedDate: null,
      logEntries:
      [
        { id:0, date: '2018-10-29', model: 'Mosquito B.IV 1:10', location: 'RC Parken', duration: '6:05' },
        { id:1, date: '2018-10-20', model: 'Chipmunk', location: 'Kildedal', duration: '4:05' },
        { id:2, date: '2018-08-17', model: 'Chipmunk', location: 'Kildedal', duration: '5:22' }
      ]
    },
    methods:
    {
      addNewEntry : function()
      {
        this.logEntries.push({ id:2, date: this.selectedDate, model: this.selectedModel, location: 'Kildedal', duration: '3:22' });
        $('#addEntryDialog').modal('hide');
      }
    }
  });

  $('.date-input').datepicker();

});