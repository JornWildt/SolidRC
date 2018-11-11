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
  async addImage(image)
  {
    if (image)
    {
      let imageName = this.generateImageName(image.name);
      let imageUrl = ImageRepository.ImageUrl + imageName;

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
    await this.fetcher.webOperation('DELETE', imageUrl,
    {
      credentials: 'include'
    });
  }


  generateImageName(name)
  {
    name = this.generateValidUrlName(name);

    let dotPos = name.lastIndexOf('.');
    let nameBase = (dotPos >= 0 ? name.substring(0, dotPos) : name);
    let nameExt = (dotPos >= 0 ? name.substring(dotPos+1, Infinity) : '');

    const timestamp = Math.floor(Date.now() / 1000);
    return `${nameBase}-${timestamp}.${nameExt}`;
  }
}


ImageRepository.ImageUrl = 'https://elfisk.solid.community/public/solidrc/images/';
