
$('#view').click(async function loadProfile() {
  // Set up a local data store and associated data fetcher
  const FOAF = $rdf.Namespace('http://xmlns.com/foaf/0.1/');
  const store = $rdf.graph();
  const fetcher = new $rdf.Fetcher(store);

  // Load the person's data into the store
  const person = $('#profile').val();
  await fetcher.load(person);

  // Display their details
  const fullName = store.any($rdf.sym(person), FOAF('name'));
  $('#fullName').text(fullName && fullName.value);

  const friends = store.each($rdf.sym(person), FOAF('knows'));
  $('#friends').empty();
  friends.forEach(async (friend) => {
	await fetcher.load(friend);
	const fullName = store.any(friend, FOAF('name'));
	$('#friends').append(
  	$('<li>').append(
    	$('<a>').text(fullName && fullName.value || friend.value)
            	.click(() => $('#profile').val(friend.value))
            	.click(loadProfile)));
  });
});
