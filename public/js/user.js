import { showAlert, hideAlert } from './alerts.js';

// * UPDATE USER PHOTO
const changePhoto = document.getElementById('change-user-picture');
// console.log(changePhoto);

changePhoto.addEventListener('change', async (e) => {
  let formData = new FormData();
  formData.append('photo', changePhoto.files[0]);
  //   console.log('test');
  try {
    const result = await fetch(
      `/api/v1/users/uploadphoto/${changePhoto.dataset.id}`,
      {
        method: 'PATCH',
        body: formData,
      }
    );

    const parsedResult = await result.json();
    if (parsedResult.status === 'success') {
      showAlert(parsedResult.status, 'Image successfully updated');

      setTimeout(location.reload(), 4000);
    } else {
      showAlert(parsedResult.status, 'Something went wrong.');
    }
  } catch (error) {
    console.log(error);
  }
});

// * UPDATE USER DETAILS

const btnUpdateDetails = document.getElementById('update-user-details');
const orderHeaders = document.querySelectorAll('.order-header');

btnUpdateDetails.addEventListener('click', async (e) => {
  const inputFields = document.querySelectorAll('.user-details-input');

  let data = {};

  inputFields.forEach((field) => {
    if (
      !field.classList.contains('password') &&
      !field.classList.contains('email')
    ) {
      data[field.name] = field.value;
    }
  });

  try {
    const result = await fetch(`/api/v1/users/${btnUpdateDetails.dataset.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const parsedResult = await result.json();
    if (parsedResult.status === 'success') {
      showAlert(parsedResult.status, 'User details successfully updated');

      setTimeout(location.reload(), 4000);
    } else {
      showAlert(parsedResult.status, 'Something went wrong.');
    }
  } catch (error) {
    console.log(error);
  }
});

// * CHANGE PASSWORD

const btnChangePassword = document.getElementById('change-password-btn');

btnChangePassword.addEventListener('click', (e) => {
  const markup = `<div class='change-password-div'>
  <h3>Change your password</h3>
    <label for="current-password">Current Password</label>
    <input type="password" name='current-password' id='current-password'>
    <label for="new-password">New Password</label>
    <input type="password" name='new-password' id='new-password'>
    <label for="confirm-new-password">Confirm New Password</label>
    <input type="password" name='confirm-new-password' id='confirm-new-password'>
    <div class='change-password-div--buttons'>
    <button id='change-password' data-id=${btnChangePassword.dataset.id}>Change Password</button>
    <button id='cancel-password'>Cancel</button>
    </div>
    </div>`;

  const body = document.querySelector('body');
  body.insertAdjacentHTML('afterbegin', markup);

  const passDiv = document.querySelector('.change-password-div');
  const btnChangePass = document.getElementById('change-password');
  const btnCancelPass = document.getElementById('cancel-password');
  const currentPass = document.getElementById('current-password');
  const newPass = document.getElementById('new-password');
  const confirmNewPass = document.getElementById('confirm-new-password');
  const email = document.getElementById('email-input');

  btnChangePass.addEventListener('click', async (e) => {
    if (newPass.value === confirmNewPass.value) {
      //   if (newPass.value.length >= 8) {
      let data = {};

      data['email'] = email.value;
      data['currentPass'] = currentPass.value;
      data['password'] = confirmNewPass.value;
      data['metadata.passwordChangedAt'] = new Date(Date.now());

      // console.log(data);

      const result = await fetch(
        `/api/v1/users/updatepassword/${e.target.dataset.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      );

      const parsedResult = await result.json();
      // console.log(parsedResult);
      if (parsedResult.status === 'success') {
        showAlert(parsedResult.status, 'Password changed successfully');

        const passDiv = document.querySelector('.change-password-div');
        passDiv.parentElement.removeChild(passDiv);
      } else {
        showAlert(parsedResult.status, parsedResult.message);
      }
      //   } else {
      //     showAlert(
      //       'fail',
      //       'Password does not meet minimum length requirements!'
      //     );
      //   }
    } else {
      showAlert('fail', 'Passwords do not match!');
    }
  });

  btnCancelPass.addEventListener('click', (e) => {
    passDiv.parentElement.removeChild(passDiv);
  });
});

const orderDetails = orderHeaders.forEach((header) => {
  header.addEventListener('click', (e) => {
    const orderDetails = header.nextElementSibling;
    orderDetails.classList.toggle('hidden');
  });
});

// * TOGGLE MY ORDERS AND MY WISHLIST

const ordersHeader = document.querySelector('#myorders-header');
const wishlistHeader = document.querySelector('#mywishlist-header');

ordersHeader.addEventListener('click', () => {
  ordersHeader.nextElementSibling.classList.toggle('hidden');
});

wishlistHeader.addEventListener('click', () => {
  wishlistHeader.nextElementSibling.classList.toggle('hidden');
});
