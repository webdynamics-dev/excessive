/* eslint-disable*/

import { showAlert, hideAlert } from './alerts.js';

import {
  addToCart,
  removeFromCart,
  removeAll,
  listCart,
  testFunc,
} from './cart.js';

//! ===================================================== //
//  DOM ELEMENTS

let hamburger = document.querySelector('i.fa-bars');
let topDiv = document.querySelector('#top-div');
const mainNav = document.querySelector('#main-nav');
let mainMenu = document.querySelector('.main-menu');

const likeButtons = document.querySelectorAll('.fa-heart');
const shareButtons = document.querySelectorAll('.fa-share-from-square');

const loginOut = document.getElementById('login-link');

const cart = document.getElementById('cart');

const cartCount = document.querySelector('#cartCount');

const newsletterInput = document.getElementById('newsletter-input');
const newsletterBtn = document.getElementById('newsletter-subscribe');

window.addEventListener('scroll', () => {
  if (window.location.pathname === '/') {
    if (document.body.scrollTop > 1 || document.documentElement.scrollTop > 1) {
      document.getElementById('top-div').classList.add('sticky');
    } else {
      document.getElementById('top-div').classList.remove('sticky');
    }
  }
});

likeButtons.forEach((like) => {
  like.addEventListener('click', async (e) => {
    e.preventDefault();

    const result = await fetch(
      `/api/v1/users/wishlist/${e.target.id.split('-')[0]}`,
      {
        method: 'PATCH',
      }
    );

    const data = await result.json();

    if (data.status === 'success') {
      if (data.inList === true) {
        e.target.classList.remove('fa-regular');
        e.target.classList.add('fa-solid');
        showAlert(data.status, data.message);
      } else if (data.inList === false) {
        e.target.classList.add('fa-regular');
        e.target.classList.remove('fa-solid');
        showAlert(data.status, data.message);
      }
    } else if (data.status === 'fail') {
      showAlert(data.status, data.message);
    }
  });
});

shareButtons.forEach((button) => {
  button.addEventListener('click', (e) => {
    e.preventDefault();

    if (navigator.share) {
      navigator
        .share({
          title: 'Check this item on Excessive website...',
          url: `${window.location.href}${e.target.dataset.slug}`,
        })
        .then(() => {
          console.log('Thanks for sharing!');
        })
        .catch(console.error);
    } else {
      // fallback
      window.location.href = `mailto:user@example.com?subject=Check this item on Excessive website...&body=${window.location.href}${e.target.dataset.slug}`;
    }
  });
});

hamburger.addEventListener('click', (e) => {
  e.preventDefault();

  if (mainMenu.classList.contains('closed')) {
    mainMenu.classList.remove('closed');
    topDiv.appendChild(mainMenu);
    topDiv.classList.add('open');
  } else {
    mainMenu.classList.add('closed');
    mainNav.prepend(mainMenu);
    topDiv.classList.remove('open');
  }
});

window.addEventListener('resize', (e) => {
  if (!mainMenu.classList.contains('closed')) {
    hamburger.click();
  }
});

//* login/logout functionality

loginOut.addEventListener('click', async (e) => {
  e.preventDefault();

  if (loginOut.getAttribute('href').endsWith('logout')) {
    try {
      const response = await fetch(loginOut.getAttribute('href'), {
        method: 'POST',
      });

      let text = await response.text();

      let parse = await JSON.parse(text);

      showAlert(parse.status, parse.message);

      if (parse.status === 'success') {
        window.setTimeout(() => {
          window.location.assign('/');
        }, 2000);
      }
    } catch (error) {
      console.log(error, error.message);
    }
  } else if (loginOut.getAttribute('href').endsWith('login')) {
    window.location.assign(loginOut.getAttribute('href'));
  }
});

//* cart functionality

cart.addEventListener('click', async (e) => {
  cart.setAttribute('href', listCart());
});

window.addEventListener('DOMContentLoaded', (e) => {
  cartCount.innerHTML = Object.keys(localStorage).filter((key) =>
    key.startsWith('CI')
  ).length;

  // document.getElementById('top-div').classList.add('transparent');
  if (window.location.pathname === '/') {
    topDiv.classList.remove('sticky');
  }
});

newsletterBtn.addEventListener('click', async (e) => {
  if (newsletterInput.validity.valid && newsletterInput.value.length >= 3) {
    const result = await fetch('/api/v1/newsletter/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: newsletterInput.value }),
    });

    const data = await result.json();

    showAlert(data.status, data.message);
  } else if (
    !newsletterInput.validity.valid ||
    newsletterInput.value.length < 3
  ) {
    showAlert('fail', 'You must enter a valid email address');
  }
});

// close notification bar on top

// const notificationClose = document.querySelector('.notification-close');
// const notificationBar = document.querySelector('.notification');
// const body = document.querySelector('body');

// notificationClose.addEventListener('click', () => {
//   notificationBar.classList.add('closed');
// });

// hamburger menu toggle opened/closed

// display filter dropdown

// const filterIcon = document.querySelector('i.fa-filter');
// const filterField = document.querySelector('#filter-list');

// filterIcon.addEventListener('click', (e) => {
//   filterField.classList.toggle('visible');
//   e.preventDefault();
// });
