async function showSolidLogin()
{
  const popupUri = '/lib/solid-auth-client/dist-popup/popup.html';
  const session = await solid.auth.popupLogin({ popupUri });
  if (session)
    window.location.replace(homeRedirectUrl);
}


$(function ($) {
  $('#logout').hide();

  $('#login-button').click(showSolidLogin);
  
  solid.auth.trackSession(session => {    
      const loggedIn = !!session;
      if (!loggedIn && window.location != loginRedirectUrl)
        window.location.replace(loginRedirectUrl);
      $('#login-container').toggle(!loggedIn);
      $('#logout-container').toggle(loggedIn);
  
      if (session) {
        $('#user-badge').attr('title', "Logged in as '" + session.webId + "'");
      }
    });
  
  $('#logout-button').click(() => solid.auth.logout());  
  
  
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

function DebugJson(x)
{
  console.debug(JSON.stringify(x,null,2));
}


function sleep(ms)
{
  return new Promise(resolve => setTimeout(resolve, ms));
}

let ViewModelBase =
{
  validationStatus(val, extra) {
    let c = this.validationStatus2(val, extra);
    c["form-control"] = true;
    return c;
  },


  validationStatus2(val, extra) {
    let c = {
      error: val.$error,
      dirty: val.$dirty
    };
    if (extra)
      c[extra] = true;
    return c;
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