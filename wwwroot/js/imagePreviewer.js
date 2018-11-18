class ImagePreviewer
{  
  constructor(imgElementId, imgCanvasId)
  {
    this.imgElementId = imgElementId;
    this.imgCanvasId = imgCanvasId;
  }


  /** Create and show a thumbnail from an JS Image object
   * @param {Image} image Image to create thumbnail from. Could be the selected image from a file input element.
   */
  showThumbnail(image)
  {
    const imageMaxHeight = 100;
    const imageMaxWidth = 100;

    if (image && image.type.match(/image.*/))
    {
      let imgCanvas = document.getElementById(this.imgCanvasId);
      let imagePath = URL.createObjectURL(image);  
      let imgHtml = document.getElementById(this.imgElementId);
      imgHtml.src = imagePath;
      imgHtml.onload = function() {
        let ctx = imgCanvas.getContext('2d');
        
        var width = imgHtml.width;
        var height = imgHtml.height;
        const scale = Math.min(imageMaxHeight/height, imageMaxWidth/width);
        if (scale < 1)
        {
          height *= scale;
          width *= scale;
        }
  
        ctx.clearRect(0, 0, imgCanvas.width, imgCanvas.height);
        ctx.drawImage(imgHtml, (imageMaxWidth - width) / 2, (imageMaxHeight - height) / 2, width,height);
      };
    }
    else
    {
      let imgCanvas = document.getElementById(this.imgCanvasId);
      let ctx = imgCanvas.getContext('2d');
      ctx.clearRect(0, 0, imgCanvas.width, imgCanvas.height);
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
}