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


$(function ($) {
  $('[data-toggle="tooltip"]').tooltip()

  $.fn.buttonProcessing = function(active)
  {
    console.debug("Process: " + active + " (" + this.prop('id') + ")");
    if (active)
    {
      if (!this.data('normalText')) {
        this.data('normalText', this.html());
      }
      this.prop('disabled', true);
      this.html(this.data('processingText') || "Savin ...");
    }
    else
    {
      this.prop('disabled', false);
      this.html(this.data('normalText'));
    }
  }
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