/* eslint-disable*/
export const addToCart = function (itemId, number) {
  if (localStorage.getItem(itemId)) {
    const storedNumber = localStorage.getItem(itemId);
    localStorage.setItem(itemId, storedNumber * 1 + number * 1);
  } else {
    localStorage.setItem(itemId, number);
  }
};

export const removeFromCart = function (itemId) {
  localStorage.removeItem(itemId);
};

export const removeAll = function () {
  localStorage.clear();
};

export const testFunc = function () {
  let search = 'CI';
  let cartItems = Object.keys(localStorage).filter((key) =>
    key.startsWith(search)
  );
  let cartValues = Object.keys(localStorage)
    .filter((key) => key.startsWith(search))
    .map((key) => localStorage[key]);

  // console.log(cartItems, cartValues);
};

export const listCart = function () {
  let search = 'CI';
  let cartItems = Object.keys(localStorage).filter((key) =>
    key.startsWith(search)
  );
  let cartValues = Object.keys(localStorage)
    .filter((key) => key.startsWith(search))
    .map((key) => localStorage[key]);

  // console.log(cartItems, cartValues);

  if (cartItems.length > 0) {
    let cartItemsId = [];
    let cartItemsValue = [];

    cartItems.map((item) => {
      // console.log(item.split('-')[1]);
      cartItemsId.push(item.split('-')[1]);
      cartItemsValue.push(localStorage[item]);
      // console.log(`${item}, value ${localStorage[item]}`);
      // console.log(cartItemsId, cartItemsValue);
    });
    const items = `${cartItemsId}-${cartItemsValue}`;
    const urlItemsId = items.split('-')[0];
    const urlItemsValues = items.split('-')[1];
    const outputString = `/cart?ids=${urlItemsId}&amounts=${urlItemsValues}`;
    return outputString;
  } else {
    const outputString = `/cart`;
    return outputString;
  }
};

// item amount testing
// const cartCard = document.getElementsByClassName('cart-item--card');

// export const getItemAmount = function (id) {
//   const cartItem = localStorage.getItem(id);
//   console.log(cartItem);
//   return Object.values(cartItem);
// };

// * SCRIPTS SAMO ZA CART TEMPLEJTOT

const re = /cart/;
if (
  re.test(window.location.href) &&
  Object.keys(localStorage).filter((key) => key.startsWith('CI')).length > 0
) {
  // *DOM ELEMENTS
  const checkoutButton = document.getElementById('checkout');
  const cartCount = document.querySelector('#cartCount');
  const cartContainer = document.querySelector('.cart');
  const checkoutContainer = document.querySelector('.checkout');
  const itemsPrice = document.getElementById('items-price');
  const productsNumber = document.getElementById('products-number');
  const totalItemsNumber = document.getElementById('total-items-number');
  const totalCost = document.getElementById('total-cost');
  const discountSpan = document.getElementById('discount');
  const shippingSpan = document.getElementById('shipping-cost');

  checkoutButton.addEventListener('click', (e) => {
    if (checkoutButton.classList.contains('summary')) {
      if (checkoutButton.classList.contains('logged_in')) {
        cartContainer.classList.toggle('hidden');
        checkoutContainer.classList.toggle('hidden');
        checkoutButton.classList.remove('summary');
        checkoutButton.classList.add('return-to-cart');
        checkoutButton.innerHTML = 'Return to Cart';

        // ==============CHECKOUT CALCULATIONS=================== //
        let totalAmount = [];
        // console.log(window);
        console.log('test');
        const cartItems = document.querySelector('.cart__contents').childNodes;
        // console.log(cartItems);

        const checkboxes = document.querySelectorAll('.cart__checkbox');

        let i = 0;
        let y = 0;

        for (let checkbox of checkboxes) {
          if (checkbox.checked) {
            i++;

            const unitPrice = document
              .getElementById(`${checkbox.dataset.checkId}-price`)
              .innerHTML.split(' ')[1];

            const quantity = document.getElementById(
              `${checkbox.dataset.checkId}-quantity`
            ).innerHTML;

            y += quantity * 1;

            const unitAmount = unitPrice * quantity;

            totalAmount.push(unitAmount);
          }
        }

        const finalPrice = totalAmount.reduce((a, b) => {
          return a + b;
        });
        const totalProducts = i;
        const totalItems = y;

        itemsPrice.innerHTML = `€<span id="items-price">${finalPrice}</span>`;
        productsNumber.innerHTML = totalProducts;
        totalItemsNumber.innerHTML = totalItems;

        // ! DA SE IMPLEMENTIRA PO POTREBA

        let shipping = 0;

        let discount = 0;

        // ! =============================

        const totalCostForPayment = finalPrice + shipping - discount;
        totalCost.innerHTML = `€${totalCostForPayment}`;
        discountSpan.innerHTML = `€${discount}`;
        shippingSpan.innerHTML = `€${shipping}`;

        // ===================CHECKOUT CALCULATIONS================== //

        // checkoutButton.disabled = true;
      } else if (checkoutButton.classList.contains('not_logged_in')) {
        window.location.href = '/login';
      }
    } else if (checkoutButton.classList.contains('return-to-cart')) {
      cartContainer.classList.toggle('hidden');
      checkoutContainer.classList.toggle('hidden');
      checkoutButton.classList.add('summary');
      checkoutButton.classList.remove('return-to-cart');
      checkoutButton.innerHTML = 'Proceed to Checkout';
    }
  });

  //* DELETE ITEM TRASH BINS
  const deleteItems = document.querySelectorAll('.delete-item');

  for (let trashbin of deleteItems) {
    // const id = trashbin.id.split('-')[1];
    trashbin.addEventListener('click', async (e) => {
      localStorage.removeItem(`CI-${trashbin.dataset.deleteId}`);

      cart.click();
    });
  }

  // * EMPTY CART

  const emptyCart = document.getElementById('empty-cart');

  emptyCart.addEventListener('click', (e) => {
    e.preventDefault();

    let search = 'CI';
    let cartItems = Object.keys(localStorage).filter((key) =>
      key.startsWith(search)
    );

    cartItems.forEach((item) => {
      localStorage.removeItem(item);
    });
    cart.click();
  });

  //* INCREASE/DECREASE ITEM AMOUNT

  const plusAmount = document.querySelectorAll('.plus-amount');
  const minusAmount = document.querySelectorAll('.minus-amount');

  for (let plus of plusAmount) {
    plus.addEventListener('click', (e) => {
      const id = plus.previousSibling.id.split('-')[0];
      const stock = document
        .getElementById(`${id}-stock`)
        .innerText.split(' ')[2];
      // console.log(stock);
      if (plus.previousSibling.innerHTML < parseInt(stock)) {
        plus.previousSibling.innerHTML++;
        localStorage.setItem(`CI-${id}`, plus.previousSibling.innerHTML);
        window.location.href = listCart();
      }
    });
  }

  for (let minus of minusAmount) {
    minus.addEventListener('click', (e) => {
      const id = minus.nextSibling.id.split('-')[0];
      if (minus.nextSibling.innerHTML > 1) {
        minus.nextSibling.innerHTML--;
        localStorage.setItem(`CI-${id}`, minus.nextSibling.innerHTML);
        window.location.href = listCart();
      }
    });
  }

  // * CONFIRM SHIPPING INFORMATION
  const confirmDetails = document.getElementById('place-order');
  const shippingDetailsFields = document.getElementById(
    'shipping-details__fields'
  );
  const paypalContainer = document.getElementById('paypal-button-container');

  confirmDetails.addEventListener('click', (e) => {
    e.preventDefault();

    const inputs = shippingDetailsFields.childNodes;

    let i = 0;

    inputs.forEach((input) => {
      if (input instanceof HTMLInputElement) {
        if (input.value.length < 3 || !input.validity.valid) {
          i++;
          input.setAttribute('placeholder', 'Please fill in this field');
        }
      }
    });

    if (i === 0) {
      shippingDetailsFields.setAttribute('disabled', 'true');
      e.target.setAttribute('disabled', 'true');
      paypalContainer.classList.remove('hidden');
      checkoutButton.style.display = 'none';
    }
  });

  // * =========================================================
}
