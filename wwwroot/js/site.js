$('#logout').hide();

const popupUri = '/lib/solid-auth-client/dist-popup/popup.html';
$('#login-button').click(() => solid.auth.popupLogin({ popupUri }));


solid.auth.trackSession(session => {
    const loggedIn = !!session;
    $('#login-container').toggle(!loggedIn);
    $('#logout-container').toggle(loggedIn);

    if (session) {
      $('#user-badge').attr('title', session.webId);
      if (!$('#profile').val())
        $('#profile').val(session.webId);
    }
  });

$('#logout-button').click(() => solid.auth.logout());  


$(function () {
  $('[data-toggle="tooltip"]').tooltip()
})