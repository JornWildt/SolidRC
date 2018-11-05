$(async function()
{
  let modelRepo = new ModelRepository();
  await modelRepo.initialize();

  var modelViewModel = new Vue({
    el: '#modelsApp',
    data: {
      selectedName: "Mossie",
      models: []
    },
    mounted() {
      this.refresh();
      // $("#selectedDate").datepicker({
      //   format: 'yyyy-mm-dd',
      //   autoclose: true
      // }).on("changeDate", () => {this.selectedDate = $('#selectedDate').val(); });
    },
    methods:
    {
      addNewModel : function()
      {
        modelRepo.addModel(
          {
            name: this.selectedName
          });

        this.refresh();

        $('#addModelDialog').modal('hide');
      },

      deleteModel : function(model)
      {
        modelRepo.deleteModel(model);
        this.refresh();
      },

      refresh : function()
      {
        let models = modelRepo.getModels();
        this.models = models;
      }
    }
  });

  // $('.date-input').datepicker(
  //   {
  //     format: 'yyyy-mm-dd',
  //     autoclose: true
  //   }
  // );
});