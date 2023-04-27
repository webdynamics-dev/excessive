import { showAlert, hideAlert } from './alerts.js';

// * LOGIN PAGE

const login = document.getElementById('submit-login');
const email = document.getElementById('email');
const forgotPswdLink = document.querySelector('#forgotten-password').firstChild;
const password = document.getElementById('password');
// const email = document.getElementById('email');

login.addEventListener('click', async (e) => {
  e.preventDefault();

  if (password.value.length < 1 || email.value.length < 1) {
    showAlert('fail', 'Email and Password fields are mandatory!');
  } else {
    let data = {
      email: email.value,
      password: password.value,
    };

    try {
      let response = await fetch('api/v1/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      let text = await response.text();

      let parse = await JSON.parse(text);

      showAlert(parse.status, parse.message);

      // console.log(parse.status);

      if (parse.status === 'success') {
        window.setTimeout(() => {
          window.location.assign('/');
        }, 2000);
      }
    } catch (err) {
      console.error(err);
    }
  }
});

forgotPswdLink.addEventListener('click', async (e) => {
  e.preventDefault();

  // console.log(email.validity.valid);

  if (email.validity.valid === false) {
    e.preventDefault();
    showAlert('fail', 'Provide valid email for password reset');
  } else if (email.validity.valid === true) {
    e.preventDefault();
    const result = await fetch('/api/v1/users/forgotpassword', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: email.value }),
    });

    const data = await result.json();

    showAlert(data.status, data.message);
  }
});
