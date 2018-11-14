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


// Various common functionality for many pages

function countCharacter(str, char) 
{
  if (!str)
    return 0;

  var count = 0;
  for(var i = 0; i < str.length; i++)
  {
    if(str.charAt(i) === char)
      count++;
  }
  
  return count;
}

let ViewModelBase =
{
  validationStatus(val) {
    return {
      error: val.$error,
      dirty: val.$dirty
    }
  },


  showWaiting(target, text)
  {
    this.currentWaitingTarget = $(target);
    this.currentWaitingTarget.waitMe({text: text});
  },

  
  hideWaiting()
  {
    this.currentWaitingTarget.waitMe('hide');
  }
}