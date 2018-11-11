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
    async mounted() {
      // Refresh (fetch) the models for the list
      await this.refresh();
      
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
      previewModelImage : function(evt)
      {
        let image = event.target.files[0];
        if (image)
        {
          let imagePath = URL.createObjectURL(image);
          $('#modelImagePreview').css('background-image', 'url(' + imagePath + ')').addClass('image-preview');
        }
        else
        {
          $('#modelImagePreview').css('background-image', 'url()').removeClass('image-preview');
        }
      },

      addNewModel : async function()
      {
        if (!this.$v.$invalid)
        {
          await modelRepo.addModel(
            {
              name: this.modelName,
              image: $('#modelImage')[0].files[0]
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

      refresh : async function()
      {
        let models = await modelRepo.getModels();
        this.models = models;
      }
    })
  });
});