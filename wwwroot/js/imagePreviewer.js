class ImagePreviewer
{  
  constructor(imgElementId, imgCanvasId)
  {
    this.imgElementId = imgElementId;
    this.imgCanvasId = imgCanvasId;
    this.imageMaxHeight = 100;
    this.imageMaxWidth = 100;
  }


  /** Create and show a thumbnail from an JS Image object
   * @param {Image} image Image to create thumbnail from. Could be the selected image from a file input element.
   */
  showThumbnail(image)
  {
    if (image && image.type.match(/image.*/))
    {
      let previewer = this;

      // Create a complete new canvas to avoid problems with the existing canvas being "tainted" by previews.
      $('#' + this.imgCanvasId).replaceWith('<canvas id="modelImageCanvas" width="100" height="100">Your browser does not support this.</canvas>');

      let imgCanvas = document.getElementById(this.imgCanvasId);
      let imagePath = URL.createObjectURL(image);  
      let imgHtml = document.getElementById(this.imgElementId);
      imgHtml.src = imagePath;
      imgHtml.onload = function() {
        let ctx = imgCanvas.getContext('2d');
        
        var width = imgHtml.width;
        var height = imgHtml.height;
        const scale = Math.min(previewer.imageMaxHeight/height, previewer.imageMaxWidth/width);
        if (scale < 1)
        {
          height *= scale;
          width *= scale;
        }
  
        ctx.clearRect(0, 0, imgCanvas.width, imgCanvas.height);
        ctx.drawImage(imgHtml, (previewer.imageMaxWidth - width) / 2, (previewer.imageMaxHeight - height) / 2, width,height);
      };
    }
    else
    {
      clearPreview();
    }
  }


  createPreviewFile(filename)
  {
    let imgCanvas = document.getElementById(this.imgCanvasId);
    let ctx = imgCanvas.getContext('2d');

    return new Promise(function(resolve, reject)
    {
      imgCanvas.toBlob(function(blob)
      {
        let thumbnailFile = new File([blob], filename, { type: "image/png" });
        resolve(thumbnailFile);
      });
    });
  }


  loadPreview(url)
  {
    let previewer = this;
    let imgCanvas = document.getElementById(this.imgCanvasId);
    let ctx = imgCanvas.getContext('2d');

    var img = new Image();
    return new Promise((accept) =>
    {
      img.onload = function()
      {
        ctx.drawImage(img, (previewer.imageMaxWidth - img.width) / 2, (previewer.imageMaxHeight - img.height) / 2, img.width,img.height);
        accept();
      }
      img.src = url; 
    });
  }


  clearPreview()
  {
    let imgCanvas = document.getElementById(this.imgCanvasId);
    let ctx = imgCanvas.getContext('2d');
    ctx.clearRect(0, 0, imgCanvas.width, imgCanvas.height);
  }
}