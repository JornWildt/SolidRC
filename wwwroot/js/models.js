Vue.use(vuelidate.default);

$(async function()
{
  let modelRepo = new ModelRepository();
  await modelRepo.initialize();

  var modelsApp = new Vue({
    el: '#modelsApp',
    data: {
      modelName: "",
      models: []
    },
    mounted() {
      // Refresh (fetch) the models for the list
      this.refresh();
      
      // Touch all vuelidation inputs to trigger validation (and disabling the "Add" button before everything is valid)
      this.$v.$touch();
    },
    validations: {
      modelName: {
        required: validators.required
      }
    },
    methods: $.extend({}, ViewModelBase, 
    {
      addNewModel : function()
      {
        if (!this.$v.$invalid)
        {
          modelRepo.addModel(
            {
              name: this.modelName
            });

          this.refresh();

          $('#addModelDialog').modal('hide');
        }
      },

      deleteModel : function(model)
      {
        if (confirm('Delete model?'))
        {
          modelRepo.deleteModel(model);
          this.refresh();
        }
      },

      refresh : function()
      {
        let models = modelRepo.getModels();
        this.models = models;
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