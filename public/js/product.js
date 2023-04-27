import { addToCart } from './cart.js';

import { showAlert } from './alerts.js';

// const productRe = /product\//;

// DOM ELEMENTS

const addToCartBtn = document.getElementById('add-to-cart');
const quantity = document.getElementById('quantity__number');
const cartCount = document.querySelector('#cartCount');
const stock = document.getElementById('stock');
const likeButton = document.querySelector('.fa-heart');
const plusAmount = document.querySelector('.plus-amount');
const minusAmount = document.querySelector('.minus-amount');

const stars = document.querySelectorAll('i.stars');

const itemImages = document.querySelectorAll('.item-image');

addToCartBtn.addEventListener('click', (e) => {
  if (stock.innerText > 0) {
    addToCart(`CI-${addToCartBtn.dataset.id}`, quantity.value);
    cartCount.innerHTML = Object.keys(localStorage).filter((key) =>
      key.startsWith('CI-')
    ).length;
  } else {
    showAlert('fail', 'This item is currently not available for purchase.');
  }
});

plusAmount.addEventListener('click', (e) => {
  if (plusAmount.previousSibling.value < parseInt(stock.innerText)) {
    plusAmount.previousSibling.value++;
  }
});

minusAmount.addEventListener('click', (e) => {
  if (minusAmount.nextSibling.value > 1) {
    minusAmount.nextSibling.value--;
  }
});

likeButton.addEventListener('click', async (e) => {
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
      console.log('true');
      e.target.classList.remove('fa-regular');
      e.target.classList.add('fa-solid');
      showAlert(data.status, data.message);
    } else if (data.inList === false) {
      console.log('false');
      e.target.classList.add('fa-regular');
      e.target.classList.remove('fa-solid');
      showAlert(data.status, data.message);
    }
  }
});

stars.forEach((star, i) => {
  star.addEventListener('click', async (e) => {
    // console.log(star.parentElement.id.split('-')[0]);
    try {
      const result = await fetch(
        `/api/v1/products/rating/product/${
          star.parentElement.id.split('-')[0]
        }`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ rating: i + 1 }),
        }
      );
      const data = await result.json();
      showAlert(data.status, data.message);
    } catch (err) {
      console.log(err);
    }
  });

  star.addEventListener('mouseover', (e) => {
    stars.forEach((star, j) => {
      if (i >= j) {
        star.classList.add('active');
      } else {
        star.classList.remove('active');
      }
    });
  });

  star.addEventListener('mouseout', (e) => {
    stars.forEach((star) => {
      star.classList.remove('active');
    });
  });
});

itemImages.forEach((image) => {
  image.addEventListener('click', () => {
    const source = image.querySelector('img').getAttribute('src');

    const magnifiedImage = document.querySelector('.image-magnified');

    if (magnifiedImage) {
      magnifiedImage.parentElement.removeChild(magnifiedImage);
    }

    const markup = `<div class='image-magnified'><div class='image-magnified__header'><i class="fa-solid fa-xmark close-image"></i></div><div class='image-container'><img src=${source}></div></div>`;

    document.querySelector('body').insertAdjacentHTML('afterbegin', markup);

    const closeBtn = document.querySelector('.close-image');

    closeBtn.addEventListener('click', () => {
      const magnifiedImage2 = document.querySelector('.image-magnified');
      magnifiedImage2.parentElement.removeChild(magnifiedImage2);
    });
  });
});
