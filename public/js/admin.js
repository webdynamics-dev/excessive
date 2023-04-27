import { showAlert, hideAlert } from './alerts.js';

// DOM ELEMENTS

const orderHeaders = document.querySelectorAll('.order-header');
const userHeaders = document.querySelectorAll('.user-header');
const productHeaders = document.querySelectorAll('.product-header');

const btnOrders = document.querySelector('#btn-orders');
const btnProducts = document.querySelector('#btn-products');
const btnUsers = document.querySelector('#btn-users');

const btnEditProduct = document.querySelectorAll('.edit-product');
const btnDeleteProduct = document.querySelectorAll('.delete-product');

const orders = document.getElementById('orders');
const products = document.getElementById('products');
const users = document.getElementById('users');

// const headers = document.querySelectorAll('.order-header');

// INTERFACE FUNCTIONALITY

const orderDetails = orderHeaders.forEach((header) => {
  header.addEventListener('click', (e) => {
    const orderDetails = header.nextElementSibling;
    orderDetails.classList.toggle('hidden');
  });
});

const userDetails = userHeaders.forEach((header) => {
  header.addEventListener('click', (e) => {
    const userDetails = header.nextElementSibling;
    userDetails.classList.toggle('hidden');
  });
});

const productDetails = productHeaders.forEach((header) => {
  header.addEventListener('click', (e) => {
    const productDetails = header.nextElementSibling;
    const archiveDetails = header.nextElementSibling.nextElementSibling;
    productDetails.classList.toggle('hidden');

    if (!archiveDetails.classList.contains('hidden')) {
      archiveDetails.classList.toggle('hidden');
    }
  });
});

btnOrders.addEventListener('click', (e) => {
  if (!btnOrders.classList.contains('active')) {
    btnOrders.classList.add('active');
    btnProducts.classList.remove('active');
    btnUsers.classList.remove('active');
    orders.classList.remove('hidden');
    products.classList.add('hidden');
    users.classList.add('hidden');
  }
});

btnProducts.addEventListener('click', (e) => {
  if (!btnProducts.classList.contains('active')) {
    btnOrders.classList.remove('active');
    btnProducts.classList.add('active');
    btnUsers.classList.remove('active');
    orders.classList.add('hidden');
    products.classList.remove('hidden');
    users.classList.add('hidden');
  }
});

btnUsers.addEventListener('click', (e) => {
  if (!btnUsers.classList.contains('active')) {
    btnOrders.classList.remove('active');
    btnProducts.classList.remove('active');
    btnUsers.classList.add('active');
    orders.classList.add('hidden');
    products.classList.add('hidden');
    users.classList.remove('hidden');
  }
});

// ORDER SHIPPED AND !CANCELLED
const ordersShipped = document.querySelectorAll('.order-shipped');

ordersShipped.forEach((order) => {
  order.addEventListener('click', async (e) => {
    const trackingNo = order.previousElementSibling.value;

    const orderUpdateResult = await fetch('/api/v1/orders/shipped', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        trackingNumber: trackingNo,
        id: e.target.dataset.id,
        shipped: true,
        dateShipped: new Date(Date.now()),
      }),
    });

    const finalResult = await orderUpdateResult.json();

    if (finalResult.status === 'success') {
      const shipped = document.getElementById(`${e.target.dataset.id}-shipped`);
      const dateShipped = document.getElementById(
        `${e.target.dataset.id}-date-shipped`
      );
      const tracking = document.getElementById(
        `${e.target.dataset.id}-tracking`
      );

      shipped.innerHTML = finalResult.result.shipped;
      dateShipped.innerHTML = finalResult.result.dateShipped;
      tracking.innerHTML = finalResult.result.trackingNumber;

      showAlert(
        finalResult.status,
        'Shipping information succesfully updated.'
      );

      //   const btnCancelled = document.getElementById(
      //     `${e.target.dataset.id}-btn-cancelled`
      //   );
      //   btnCancelled.setAttribute('disabled', true);
      orderDomManipulate();
    } else {
      showAlert(finalResult.status, finalResult.message);
    }

    // console.log(await orderUpdateResult.json());
  });
});

// * NEW PRODUCT

const btnNewProduct = document.getElementById('new-product');

btnNewProduct.addEventListener('click', async (e) => {
  editProduct();
  retrieveProductSchema();

  const btnCancelEdit = document.getElementById('edit-cancel');
  const btnConfirmEdit = document.getElementById('edit-confirm');
  const editPanel = document.querySelector('.edit-product-div');

  btnCancelEdit.addEventListener('click', (e) => {
    editPanel.parentElement.removeChild(editPanel);
  });

  btnConfirmEdit.addEventListener('click', async (e) => {
    // const imageFields = editProductDiv.querySelectorAll('input[type=file]');
    submitProductData('POST', undefined, editPanel);
  });
});

// * EDIT PRODUCT

btnEditProduct.forEach((editButton) => {
  editButton.addEventListener('click', async (e) => {
    editProduct(editButton.dataset.id);
    // retrieveProductSchema(editButton.dataset.id);
    retrieveData(await retrieveProductSchema(editButton.dataset.id));
  });
});

function editProduct(id) {
  let title;
  let div;

  if (id === undefined) {
    title = `<div class="edit-product-div__title">
      <h3>New Product</h3>
    </div>`;
    div = `<div class="edit-product-div" id=${id}-edit-product-div data-changed="true" data-id=${id}>`;
  } else {
    title = `<div class="edit-product-div__title">
      <h3>Edit product with ID ${id}</h3>
    </div>`;
    div = `<div class="edit-product-div" id=${id}-edit-product-div data-id=${id}>`;
  }

  const markup = `${div} ${title}
  <div class="edit-product-div__fields" id=${id}-edit-product-div__fields data-id=${id}><h3>Product Data</h3></div>
  <div class="edit-product-div__images" id=${id}-edit-product-div__images data-id=${id}><h3>Product Images</h3></div>
  <div class="edit-product-div__buttons">
  <button id="edit-confirm" data-id={id}>Confirm</button>
  <button id="edit-cancel">Cancel</button>
  </div>
  </div>`;

  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
}

async function retrieveProductSchema(id) {
  const result = await fetch(`/api/v1/products/productkeys/`, {
    method: 'GET',
  });

  const data = await result.json();
  //   console.log(data);

  if (data.status === 'success') {
    const editFieldsDiv = document.getElementById(
      `${id}-edit-product-div__fields`
    );
    const editImagesDiv = document.getElementById(
      `${id}-edit-product-div__images`
    );

    // editFieldsDiv.innerHTML = '';

    data.keys.map((key) => {
      if (key === '_id' || key === '__v' || /^metadata/.test(key)) {
        editFieldsDiv.innerHTML += `<div id="edit-${key}" class="edit-field">${key}<div><input id="edit-${key}-${id}" type="text" disabled></input></div></div>`;
      } else if (key === 'images') {
        editImagesDiv.innerHTML += `<form method="post" enctype="multipart/form-data">
          <div>
            <label for="images">Choose images to upload</label>
            <input
              type="file"
              id="images"
              name="images"
              accept="image/*"
              multiple />
          </div>
          <div class="preview">
            <div id="edit-${key}-${id}" class="edit-field">This product currently has no images</div>
          </div>
          <div>
            
          </div>
        </form>`;
      } else if (key === 'coverImage') {
        editImagesDiv.innerHTML += `<form method="post" enctype="multipart/form-data">
        <div>
          <label for="coverImage">Choose cover image to upload</label>
          <input
            type="file"
            id="coverImage"
            name="coverImage"
            accept="image/*"
             />
        </div>
        <div class="preview">
          <div id="edit-${key}-${id}" class="edit-field">This product currently has no cover image</div>
        </div>
        <div>
          
        </div>
      </form>`;

        // `<div id="edit-${key}" class="edit-field">${key}<div><input id="edit-${key}-${id}" type="file" accept="image/*"></input></div></div>`;
      } else if (key === 'desc') {
        editFieldsDiv.innerHTML += `<div id="edit-${key}" class="edit-field">${key}<div><textarea id="edit-${key}-${id}" rows="10" cols="40"></textarea></div></div>`;
      } else {
        editFieldsDiv.innerHTML += `<div id="edit-${key}" class="edit-field">${key}<div><input id="edit-${key}-${id}" type="text"></input></div></div>`;
      }
    });
  }

  //  ! NEOPHODNO - KAKO VREDNOST SE PREDAVA NA NAREDNATA FUNKCIJA
  return id;
}

async function retrieveData(id) {
  try {
    const result = await fetch(`/api/v1/products/product/${id}`, {
      method: 'GET',
    });

    const data = await result.json();
    //   console.log(data);
    if (data.status === 'success') {
      Object.entries(data.data).map(([key, value] = entry) => {
        if (key !== 'metadata' && key !== 'ratingsAvg' && key !== 'id') {
          if (key === 'coverImage') {
            const field = document.getElementById(`edit-${key}-${id}`);
            // console.log(field);
            field.innerHTML = `<img src="/images/${value}">`;
          } else if (key === 'images') {
            const field = document.getElementById(`edit-${key}-${id}`);

            field.innerHTML = '';

            value.map((image) => {
              field.innerHTML += `<img src="/images/${image}">`;
            });
          } else {
            const field = document.getElementById(`edit-${key}-${id}`);
            // console.log(key, field);
            field.value = value;
          }
        } else if (key === 'metadata') {
          Object.entries(value).map(([key, value] = entry) => {
            const field = document.getElementById(`edit-metadata.${key}-${id}`);

            field.value = value;
          });
        }
      });
      const editProductDiv = document.getElementById(`${id}-edit-product-div`);
      const fields = editProductDiv.querySelectorAll(
        'input[type=text], textarea'
      );
      const imageFields = editProductDiv.querySelectorAll('input[type=file]');

      fields.forEach((field) => {
        field.addEventListener('change', (e) => {
          editProductDiv.dataset.changed = true;
        });
      });

      imageFields.forEach((imageField) => {
        imageField.addEventListener('change', (e) => {
          editProductDiv.dataset.changed = true;
        });
      });
    }
  } catch (error) {
    console.log(error);
  }

  const btnCancelEdit = document.getElementById('edit-cancel');
  const btnConfirmEdit = document.getElementById('edit-confirm');
  const editPanel = document.querySelector('.edit-product-div');

  btnCancelEdit.addEventListener('click', (e) => {
    editPanel.parentElement.removeChild(editPanel);
  });

  btnConfirmEdit.addEventListener('click', async (e) => {
    // const imageFields = editProductDiv.querySelectorAll('input[type=file]');
    submitProductData('PATCH', id, editPanel);
  });
}

async function submitProductData(method, id, editPanel) {
  let formData = new FormData();
  const editProductDiv = document.getElementById(`${id}-edit-product-div`);
  const fields = editProductDiv.querySelectorAll('input[type=text],textarea');
  const images = document.getElementById('images');

  if (editProductDiv.dataset.changed === 'true') {
    if (coverImage.files[0]) {
      formData.append('coverImage', coverImage.files[0]);
    }

    if (images.files[0]) {
      //   console.log(images.files);
      //   console.log(images.files.length);

      for (let i = 0; i < images.files.length; i++) {
        formData.append('images', images.files[i]);
      }
    }

    //  WHEN SENDING FILES VIA FETCH HEADERS-CONTENT-TYPE NEED TO BE EXPLICITLY OMITTED SO THAT THE BROWSER CAN SET THE CORRECT CONTENT TYPE AND BOUNDARIES CORRECTLY

    const response = await fetch(`/api/v1/products/productimages`, {
      method: method,
      body: formData,
    });

    const parsedResponse = await response.json();

    if (parsedResponse.status === 'success') {
      // console.log(editProductDiv);

      // console.log(fields);
      const data = {};

      // console.log(parsedResponse.images);

      if (parsedResponse.images.length > 0) {
        data.images = parsedResponse.images;
      }

      // console.log(parsedResponse.coverImage);
      data.coverImage = parsedResponse.coverImage;

      fields.forEach((field) => {
        const key = field.id.split('-')[1];

        if (key !== '_id' && key !== '__v' && !/^metadata/.test(key)) {
          if (key === 'ratings') {
            data[key] = field.value.split(','); // to send it as array instead of string
          } else {
            data[key] = field.value;
          }
        }
      });

      //   console.log(data);
      let url;

      if (method === 'POST') {
        url = '/api/v1/products/newproduct';
      } else if (method === 'PATCH') {
        url = `/api/v1/products/product/${id}`;
      }

      const response2 = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const parsedResponse2 = await response2.json();

      //   console.log(parsedResponse, parsedResponse2);

      if (parsedResponse2.status === 'success') {
        showAlert(parsedResponse2.status, parsedResponse2.message);
        editPanel.parentElement.removeChild(editPanel);
        setTimeout(location.reload(), 4000);
      } else {
        showAlert(parsedResponse2.status, parsedResponse2.message);
      }
    } else {
      showAlert(parsedResponse.status, parsedResponse.message);
    }
  } else {
    showAlert('fail', 'No changes to submit!');
  }
}

// * DELETE PRODUCT (MARK AS NOT ACTIVE)
// console.log(btnDeleteProduct);
btnDeleteProduct.forEach((button) => {
  button.addEventListener('click', async (e) => {
    // console.log(button.dataset.id);
    const result = await fetch(
      `/api/v1/products/product/${button.dataset.id}`,
      {
        method: 'DELETE',
      }
    );

    const data = await result.json();
    console.log(data);
    if (data.status === 'success') {
      const active = document.getElementById(`${button.dataset.id}-active`);
      //   console.log(data.data.status);
      active.children[0].innerHTML = data.data.metadata.active;

      showAlert(data.status, 'Product successfuly deleted.');

      orderDomManipulate();
    }
  });
});

// const paypalResult = document.querySelectorAll('.paypal-result');
// const flag = document.querySelectorAll('.transaction-flag');

// SUPPLEMENT DOM CONTENT
window.addEventListener('DOMContentLoaded', (e) => {
  // COLOR CODE ORDER HEADERS AND SHIPPPED BUTTON HANDLING
  orderDomManipulate();

  // PRODUCT ARCHIVE LISTING
  listProductArchive();
});

// FUNCTIONS

function orderDomManipulate() {
  orderHeaders.forEach((header) => {
    const paypalResult = header.querySelector('.paypal-result').lastChild;
    const flag = header.querySelector('.transaction-flag').lastChild;
    const orderId = header.parentElement.getAttribute('id');

    const shipped = document.getElementById(`${orderId}-shipped`);

    if (
      paypalResult.innerHTML == 'COMPLETED' &&
      flag.innerHTML == 'none' &&
      shipped.innerHTML == 'true'
    ) {
      header.classList.add('green-order');

      const btnShipped = document.getElementById(`${orderId}-btn-shipped`);
      const trackingNo = btnShipped.previousElementSibling;

      btnShipped.setAttribute('disabled', 'true');
      trackingNo.setAttribute('disabled', 'true');
    } else if (
      paypalResult.innerHTML !== 'COMPLETED' ||
      flag.innerHTML !== 'none'
    ) {
      header.classList.add('red-order');
    }
  });

  productHeaders.forEach((header) => {
    const active = header.nextElementSibling.querySelector('.product-active');

    if (active.children[0].innerHTML === 'false') {
      header.classList.add('deleted');
    }
  });
}

// let labels = [];

async function listProductArchive() {
  const archiveValues = document.querySelectorAll('.archive-value');

  //   RENDER ARCHIVE LABELS

  archiveValues.forEach(async (value) => {
    const productId = value.getAttribute('id').split('-')[0];
    const version = document.getElementById(`${productId}-version`).innerHTML;

    if (version > 1) {
      const archiveResult = await fetch(
        `/api/v1/products/archived/${productId}`
      );
      const finalResult = await archiveResult.json();

      //   console.log(finalResult.data);

      await finalResult.data.map((versionInstance) => {
        let markup = `<label id="${productId}-${versionInstance.version}-archive-label" data-id=${productId}-archive-label data-version=${versionInstance.version} class="archive-label">${versionInstance.version}</label>`;

        value.innerHTML += markup;

        // labels.push(markup + ',');
      });
      //   console.log(await finalLabels);
      //   console.log(value.innerHTML);
      const archiveLabels = document.querySelectorAll(
        `[data-id="${productId}-archive-label"]`
      );
      //   console.log(archiveLabels);

      archiveLabels.forEach((label) => {
        label.addEventListener('click', async (e) => {
          const archiveData = await fetch(
            `/api/v1/products/archived/${label.dataset.id.split('-')[0]}/${
              label.dataset.version
            }`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );
          const parsedData = await archiveData.json();
          //   console.log(Object.keys(parsedData.data[0].archivedData));
          //   console.log(Object.values(parsedData.data[0].archivedData));

          const archiveDetails = document.getElementById(
            `${productId}-archive-details`
          );

          archiveDetails.classList.remove('hidden');
          archiveDetails.innerHTML = '';
          archiveDetails.innerHTML += `<h3>Archive version ${parsedData.data[0].version}</h3>`;

          Object.entries(parsedData.data[0].archivedData).map(
            ([key, val] = entry) => {
              if (key === 'metadata') {
                Object.entries(parsedData.data[0].archivedData.metadata).map(
                  ([key2, val2] = entry2) => {
                    archiveDetails.innerHTML += `<div class="metadata.${key2}">metadata.${key2}
                        <div>${val2}</div></div>`;
                  }
                );
              } else if (key === 'coverImage') {
                archiveDetails.innerHTML += `<div class="${key}">
                <img src="/images/${val}"></div>`;
              } else if (key === 'images') {
                parsedData.data[0].archivedData.images.map((image) => {
                  archiveDetails.innerHTML += `<div class="${key}">
                <img src="/images/${image}"></div>`;
                });
              } else {
                archiveDetails.innerHTML += `<div class="${key}">${key}
            <div>${val}</div></div>`;
              }
            }
          );
        });
      });
    }
  });
}
