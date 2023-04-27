import { showAlert } from './alerts.js';

// DOM ELEMENTS
const password = document.getElementById('password');
const confirmPassword = document.getElementById('confirm-password');
const submit = document.getElementById('submit-new-password');
const resetToken =
  window.location.href.split('/')[window.location.href.split('/').length - 1];

submit.addEventListener('click', async (e) => {
  e.preventDefault();

  if (
    password.validity.valid === false ||
    confirmPassword.validity.valid === false
  ) {
    showAlert(
      'fail',
      'Both password fields must be filled in, and minimum password length should be 8 characters!'
    );
  } else if (password.value !== confirmPassword.value) {
    showAlert('fail', 'The password and confirm-password fields do not match!');
  } else if (
    password.validity.valid === true &&
    confirmPassword.validity.valid === true &&
    password.value === confirmPassword.value
  ) {
    const result = await fetch(`/api/v1/users/resetpassword/${resetToken}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password: password.value }),
    });

    const data = await result.json();

    if (data.status === 'success') {
      showAlert(data.status, data.message);
      setTimeout(window.location.assign('/login'), 4000);
    } else if (data.status === 'fail') {
      showAlert(data.status, data.message);
    }
  }
});
