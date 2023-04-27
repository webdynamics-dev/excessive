import { showAlert, hideAlert } from './alerts.js';

// * SIGNUP PAGE

const signup = document.getElementById('submit-signup');
const password = document.getElementById('password');
const confirmPassword = document.getElementById('confirm-password');

signup.addEventListener('click', async (e) => {
  e.preventDefault();

  if (password.value.length < 1) {
    showAlert('fail', 'Password is mandatory!');
  } else if (password.value !== confirmPassword.value) {
    showAlert('fail', 'Passwords do not match!');
  } else {
    let data = {
      email: email.value,
      password: password.value,
      firstName: firstName.value,
      lastName: lastName.value,
      address: `${address.value},${zipcode.value} ${city.value},${country.value}`,
    };

    try {
      let response = await fetch('/api/v1/users/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      // console.log(response);
      let text = await response.json();

      // let parse = await JSON.parse(text);

      showAlert(text.status, text.message);

      // console.log(text);

      if (text.status === 'success') {
        window.setTimeout(() => {
          window.location.assign('/');
        }, 2000);
      }
    } catch (err) {
      console.error(err);
    }
  }
});
