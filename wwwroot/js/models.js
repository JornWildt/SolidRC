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
      this.refresh();
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
        modelRepo.addModel(
          {
            name: this.modelName
          });

        this.refresh();

        $('#addModelDialog').modal('hide');
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