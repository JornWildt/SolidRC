/** Image repository with CRUD methods for images.
 */
class ImageRepository extends ORDFMapper
{
  constructor()
  {
    super();
  }


  /** Add image.
   * 
   * @param {File object} image - Image to upload (represented as a File object from a file input element).
   */
  async addImage(image, name)
  {
    if (image)
    {
      let imageUrlName = this.generateImageName(image.name, name);
      let imageUrl = ImageRepository.ImageUrl + imageUrlName;

      await this.fetcher.webOperation('PUT', imageUrl,
      {
        body: image,
        contentType: image.type,
        credentials: 'include'
      });

      return imageUrl;
    }

    return null;
  }


  /** Delete image.
   * 
   * @param {URL string} imageUrl - Image URL.
   */
  async deleteImage(imageUrl)
  {
    await this.deleteObject(imageUrl);
  }


  generateImageName(orgName, requiredName)
  {
    // If required name has no extension then get extension from original name
    let dotPos = requiredName.lastIndexOf('.');
    if (dotPos < 0)
    {
      dotPos = orgName.lastIndexOf('.');
      let nameExt = (dotPos >= 0 ? orgName.substring(dotPos, Infinity) : '');
      requiredName = requiredName + nameExt;
    }

    let name = this.generateValidUrlName(requiredName).toLowerCase();
    return name;
  }
}


ImageRepository.ImageUrl = 'https://elfisk.solid.community/public/solidrc/images/';
