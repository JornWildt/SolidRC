Vue.use(vuelidate.default);

$(async function()
{
  let modelRepo = new ModelRepository();
  await modelRepo.initialize('all');

  let imagePreviewer = new ImagePreviewer('modelImageStore', 'modelImageCanvas');

  var modelsApp = new Vue({
    el: '#modelsApp',
    data: {
      loading: true,
      formState: 'add',
      formTitle: "",
      currentModel: null,
      modelName: "",
      hasModifiedPhoto: false,
      models: []
    },
    async mounted() {
      // Refresh (fetch) the models for the list
      await this.refresh();

      // Show entries now that everything is loaded
      this.loading = false;
      
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
        imagePreviewer.showThumbnail(image);
        this.hasModifiedPhoto = true;
      },

      editNewModel : function()
      {
        this.formTitle = "Add model";
        this.formState = 'add';
        this.currentModel = null;
        this.modelName = '';
        imagePreviewer.clearPreview();
        $('#modelDialog').modal('show');
      },

      addModel : async function()
      {
        if (!this.$v.$invalid)
        {
          this.showWaiting('#modelDialog', 'Saving');

          let imageFile = $('#modelImage')[0].files[0];
          let thumbnailFile = imageFile ? await imagePreviewer.createPreviewFile("thumbnail.png") : null;

          await modelRepo.addModel(
          {
            name: this.modelName,
            imageFile: imageFile,
            thumbnailFile: thumbnailFile
          });

          await this.refresh();

          this.hideWaiting();
          $('#modelDialog').modal('hide');
        }
      },

      editModel : async function(model)
      {
        this.formTitle = "Edit model";
        this.formState = 'edit';
        this.currentModel = model;
        this.modelName = model.name;
        if (model.thumbnail)
          await imagePreviewer.loadPreview(model.thumbnail);
        else
          imagePreviewer.clearPreview();
        $('#pageAlert').hide();
        $('#modelDialog').modal('show');
      },

      saveModel : async function()
      {
        if (!this.$v.$invalid)
        {
          this.showWaiting('#modelDialog', 'Saving');

          this.currentModel.name = this.modelName;
          this.currentModel.imageFile = $('#modelImage')[0].files[0];
          this.currentModel.thumbnailFile = (this.currentModel.imageFile ? await imagePreviewer.createPreviewFile("thumbnail.png") : null);

          // console.debug(this.currentModel.image);
          // console.debug(this.currentModel.thumbnail);

          await modelRepo.updateModel(this.currentModel);
          await this.refresh();

          $('#modelDialog').modal('hide');
          if (this.hasModifiedPhoto)
          {
            $('#pageAlert').show();
            this.hasModifiedPhoto = false;
          }
          this.hideWaiting();
        }
      },

      deleteModel : async function(model)
      {
        if (confirm('Delete model?'))
        {
          console.debug("Start delete model");
          await modelRepo.deleteModel(model);
          await this.refresh();
          console.debug("Done delete model");
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
