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


// Standard Vue components


Vue.component('derived-value', {
  props: ['item'],
  template: `<span>
  <span v-if="item.valid">{{ item.value }}</span>
  <span v-if="!item.valid" :title="item.value">---</span>
  </span>`
})


// Validators using vuelidator.js
const dateValidator = (value) => new moment(value, 'YYYY-MM-DD').isValid();
const timespanValidator = (value) => /^(\d+:)?(\d{1,2}:)?(\d{1,2})?$/.test(value);

let ViewModelBase =
{
  validationStatus(val) {
    return {
      error: val.$error,
      dirty: val.$dirty
    }
  }
}