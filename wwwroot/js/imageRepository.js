/** Image repository with CRUD methods for images.
 */
class ImageRepository extends ORDFMapper
{
  constructor(baseUrl)
  {
    super();
    this.baseUrl = baseUrl;
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
      let imageUrl = this.baseUrl + imageUrlName;

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


  async updateImage(image, url)
  {
    return this.fetcher.webOperation('PUT', url,
    {
      body: image,
      contentType: image.type,
      credentials: 'include'
    });
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

    // Normally we do not allow dots in URLs as the Solid server uses that for content type(!)
    // So remove extension before creating name and then add the extension again afterwards.
    dotPos = requiredName.lastIndexOf('.');
    let nameExt = (dotPos >= 0 ? requiredName.substring(dotPos, Infinity) : '');
    requiredName = requiredName.substring(0, dotPos);

    let name = this.generateValidUrlName(requiredName).toLowerCase() + nameExt;
    return name;
  }
}

