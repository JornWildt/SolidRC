# SolidRC
A journey into building Solid applications with C#, Dotnet Core, RDFLIB.js, Vue.js and other JavaScript libraries (vuelidator, moment).

Trying to create a re-useable pattern for doing data-entry, validation and querying on data stored in Solid PODs.

Example case is a logbook for logging flights with remote controlled aircraft models.

Techniques used in the project:
* Logging into a POD using the standard solid-auth-client.js.
* Using Vue.js to implement user interfaces in JavaScript.
* Displaying tables with linked data resources in Vue.
* Modal dialogues for editing linked data (using Bootstrap).
* Input validation using Vuelidator.js.
* Mapping linked data to JavaScript arrays and objects (using this project's ORDFMapper.js).
* Image upload, preview and resizing to thumbnails in JavaScript.
* "Please wait" overlay spinner on image upload (using waitMe.js).
* Displaying SVG icons (from Open Iconic).
* Bulding web-sites with Dotnet Core MVC.

Related resources:
- What is Solid? - https://solid.inrupt.com/
- RDFLIB: https://solid.inrupt.com/docs/manipulating-ld-with-rdflib
