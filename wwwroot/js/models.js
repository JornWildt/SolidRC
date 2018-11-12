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

          let imgHtml = document.getElementById('modelImageStore');
          imgHtml.src = imagePath;
          imgHtml.onload = function() {
            let imgCanvas = document.getElementById('modelImageCanvas');
            let ctx = imgCanvas.getContext('2d');
            
            const max_height = 100;
            const max_width = 100;
            var width = imgHtml.width;
            var height = imgHtml.height;

            scale = Math.min(max_height/height, max_width/width);
            if (scale < 1)
            {
              height *= scale;
              width *= scale;
            }

            ctx.clearRect(0, 0, imgCanvas.width, imgCanvas.height);
            ctx.drawImage(imgHtml, (max_width - width) / 2, (max_height - height) / 2, width,height);
          };

        }
        else
        {
          let imgCanvas = document.getElementById('modelImageCanvas');
          let ctx = imgCanvas.getContext('2d');
          ctx.clearRect(0, 0, imgCanvas.width, imgCanvas.height);
        }
      },

      addNewModel : async function()
      {
        if (!this.$v.$invalid)
        {
          let imgCanvas = document.getElementById('modelImageCanvas');
          let ctx = imgCanvas.getContext('2d');

          // Get model name before "this" context disappears
          let modelName = this.modelName;

          await new Promise(function(resolve, reject)
          {
            imgCanvas.toBlob(function(blob)
            {
              resolve(blob);
            });
          })
          .then(blob =>
          {
            let thumbnail = new File([blob], "thumbnail.png", { type: "image/png" });
            return modelRepo.addModel(
            {
              name: modelName,
              image: $('#modelImage')[0].files[0],
              thumbnail: thumbnail
            });
          })

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
