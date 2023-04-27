// let notification = document.querySelector('.notification');
// let header = document.querySelector('header');
// let body = document.querySelector('body');
// let mainNav = document.querySelector('#main-nav');

// notification.innerHTML = `This is notification placeholder!
// <i
//   id="notification-close"
//   class="fa-solid fa-xmark notification-close"
// ></i>`;

// header.innerHTML = `<h1><i class="fa-solid fa-gem"></i>Jewelry House</h1>
// `;

// mainNav.innerHTML = `
// <div class="main-menu closed">

//   <a href="/products.html">Jewelry</a>
//   <a href="">Clothing</a>
//   <a href="">SALE</a>
//   <a href="">Blog</a>
//   <a href="">About Us</a>
//   <a href="">Contact</a>
// </div>
// <div class="search">
//   <input
//     id="filter-list"
//     list="types"
//     placeholder="Filter items..."
//   />

//   <datalist id="types">
//     <option value="Earrings"></option>
//     <option value="Necklace"></option>
//     <option value="Rings"></option>
//     <option value="Bands"></option>
//   </datalist>

//   <a id="filter" href=""><i class="fa-solid fa-filter"></i></a>
//   <a id="cart" href=""><i class="fa-solid fa-cart-shopping"></i></a>
//   <a id="login-link" href=""><i id="login" class="fa-regular fa-user"></i><span id="login-text">Login</span></a>
//   <a id="hamburger" href=""><i class="fa-solid fa-bars"></i></a>
// </div>`;

body.innerHTML += `<!-- login form -->

<div class="login-form closed">
  <div class="login-form-contents">
    <i id="login-close" class="fa-solid fa-xmark login-close"></i>
    <h2 class="login">LOG IN</h2>
    <p class="login">
      Sign-in to view your recent purchases or wishlist and manage your
      personal details and preferences here.
    </p>

    <form action="">
      <input id="username" type="text" placeholder="User Name..." />

      <input id="password" type="password" placeholder="Password..." />
      <button id="login" type="submit">Log In</button>
      <p>New User?</p>
      <button id="register" type="submit">Register</button>
    </form>
  </div>
  <div class="registration-form closed">
    <i id="register-close" class="fa-solid fa-xmark"></i>
    <h2>Register new user</h2>
    <form action="" class="registration-form">
      <input type="firstname" placeholder="Name" />
      <input type="lastname" placeholder="Surname" />
      <input type="email" placeholder="Email" />
      <input type="password" placeholder="Password" />
      <input type="password" placeholder="Repeat password" />
      <input type="address" placeholder="Address" />
      <input type="city" placeholder="City" />
      <input type="zipcode" placeholder="Postcode" />
      <select name="gender" id="gender">
        <option value="Male">Male</option>
        <option value="Female">Female</option>
      </select>
    </form>
    <div id="register-user">
      <button id="btn-register">Register</button>
    </div>
  </div>
</div>`;

// close login and register user windows

// todo da se prepravi login prozorecot da funkcionira i na drugite strani (mozebi da se prefrli HTML strukturata vo init.js)

const loginClose = document.querySelector('.login-close');
const loginForm = document.querySelector('.login-form');
const loginLink = document.querySelector('#login-link');
const btnRegister = document.querySelector('#register');
const loginFormContents = document.querySelector('.login-form-contents');
const registrationForm = document.querySelector('.registration-form');

loginClose.addEventListener('click', () => {
  loginForm.classList.toggle('closed');
});

loginLink.addEventListener('click', (e) => {
  loginForm.classList.toggle('closed');
  loginFormContents.classList.remove('closed');
  registrationForm.classList.add('closed');
  e.preventDefault();
});

const registerClose = document.querySelector('#register-close');

registerClose.addEventListener('click', () => {
  loginForm.classList.toggle('closed');
});

btnRegister.addEventListener('click', (e) => {
  loginFormContents.classList.toggle('closed');
  registrationForm.classList.toggle('closed');
  e.preventDefault();
});

// ! testing

async function onNode() {
  // fetch("http://127.0.0.1:5000/kurac")
  //   .then((response) => {
  //     return response.text();
  //   })
  //   .then((response) => {
  //     console.log(response);
  //   })
  //   .catch((err) => console.log(err));
  try {
    let response = await fetch('http://127.0.0.1:5000/kurac', {
      method: 'GET',
    });

    let text = await response.text();

    console.log(text);
    testBtn.textContent = text;
  } catch (err) {
    console.error(err);
  }
  // const xhr = new XMLHttpRequest();

  // xhr.open("GET", "http://127.0.0.1:5000/kurac", false);
  // xhr.send();

  // console.log(xhr.responseText);
}

const testBtn = document.querySelector('#testing');

testBtn.addEventListener('click', () => {
  onNode();
});
