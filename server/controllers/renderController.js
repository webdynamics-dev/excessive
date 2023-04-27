// 3RD PARTY IMPORTS

// INTERNAL IMPORTS
const catchAsync = require('../utils/catchErrors');
const { Product } = require('../models/productModel');
const { User } = require('../models/userModel');
const { Order } = require('../models/ordersModel');

// * RENDER USER

exports.getUser = catchAsync(async (req, res, next) => {
  if (req.body.userId) {
    try {
      const keys = Object.keys(User.schema.paths);

      for (let i = 0; i < keys.length; i++) {
        if (keys[i].startsWith('metadata') || keys[i].startsWith('_')) {
          keys.splice(i, 1);
          i--;
        }
      }

      const result = await User.findById(req.params.id).populate('wishList');
      const orders = await Order.find({ userId: req.params.id }).populate(
        'items.productId'
      );

      res.status(200).render('user', {
        userDetails: result,
        keys: keys,
        orders: orders,
      });
    } catch (error) {
      res.status(500).json({
        status: 'fail',
        error: error.message,
      });
    }
  } else {
    res.status(401).json({
      status: 'fail',
      message: 'User not logged in!',
    });
  }
});

// * RENDER ALL PRODUCTS
exports.getOverview = catchAsync(async (req, res, next) => {
  const products = await Product.find({ 'metadata.active': true });

  if (!products) {
    return res.status(404).json({
      status: 'fail',
      message: 'No products found!',
    });
  }
  // console.log(res.locals.userData);
  if (req.body.user) {
    wishList = res.locals.userData.wishList;
  } else {
    wishList = undefined;
  }

  res.status(200).render('overview', {
    title: 'Excessive - Fashion and Jewelry Store',
    description: 'Fashion and Jewelry store',
    products: products,
    wishList: wishList,
  });

  next();
});

// * RENDER ONE PRODUCT BY SLUG
exports.renderOneProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findOne({ slug: req.params.slug });

  if (!product) {
    return res.status(404).json({
      status: 'fail',
      message: 'Product not found!',
    });
  }

  if (req.body.user) {
    wishList = res.locals.userData.wishList;
  } else {
    wishList = undefined;
  }

  res.status(200).render('product', {
    title: product.name,
    description: product.desc,
    product: product,
    wishList: wishList,
  });

  next();
});

// * RENDER THE SIGNUP AND TEMPLATE

exports.renderSignup = catchAsync(async (req, res, next) => {
  res.status(200).render('signup', { title: 'Signup to Excessive' });
});

exports.renderLogin = catchAsync(async (req, res, next) => {
  res.status(200).render('login', { title: 'Login to Excessive' });
});

// *RENDER CART ITEMS

exports.renderCart = catchAsync(async (req, res, next) => {
  // console.log(req.query.ids);
  // console.log(`ebate${req.query.amounts}`);
  // const ids = req.query.ids;
  // const amounts = req.query.amounts;

  // ! query stringot mora da e formatiran kako array za prebaruvanje niz mongoose
  // console.log([itemsArray[0]]);

  if (req.query.ids) {
    const itemsArray = req.query.ids.split(',');
    const itemsAmount = req.query.amounts.split(',');

    let cartItems = [];

    for (let i = 0; i < itemsArray.length; i++) {
      // console.log(`array ${itemsArray[i]}`);
      let item = await Product.findById(itemsArray[i]);
      // console.log(`test ${item}`);
      item.amount = itemsAmount[i];
      cartItems.push(item);
    }
    // console.log(cartItems);
    if (cartItems.length > 0) {
      return res.status(200).render('cart', {
        title: 'Excessive Shopping Cart',
        cartItems: cartItems,
      });
    } else {
      return res.status(400).render('cart', {
        title: 'Excessive Shopping Cart',
        cartItems: undefined,
      });
    }
  } else {
    return res.status(200).render('cart', {
      title: 'Excessive Shopping Cart',
      cartItems: undefined,
    });
  }

  // console.log(req.body.cartIDs, cartItems);
});

// * RENDER SUCCESSFUL ORDER

exports.renderOrderResult = catchAsync(async (req, res, next) => {
  if (req.params.status === 'success') {
    return res.status(200).render('order-success', {
      title: 'Order successfuly placed',
      status: req.params.status,
      orderId: req.params.orderId,
    });
  } else if (req.params.status === 'failed') {
    return res.status(200).render('order-failed', {
      title: 'Problem with order',
      status: req.params.status,
      orderId: req.params.orderId,
    });
  }
});

// * RENDER ADMINISTRATOR

exports.renderAdministrator = catchAsync(async (req, res, next) => {
  // console.log(req.body.userId);
  // console.log(req.body.user.metadata.role);

  const allUsers = await User.find().populate('metadata.active');
  const allOrders = await Order.find().populate('userId items.productId');
  const allProducts = await Product.find().populate();

  try {
    if (req.body.userId && req.body.user.metadata.role === 'admin') {
      res.status(200).render('admin', {
        title: 'Excessive - Administrator Panel',
        loggedUser: req.body.user,
        allUsers: allUsers,
        allOrders: allOrders,
        allProducts: allProducts,
      });
    } else {
      res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to view this resource',
      });
    }
  } catch (error) {
    console.log(error.message);
  }
});

// * RENDER CONTACT

exports.renderContact = catchAsync(async (req, res, next) => {
  res.status(200).render('contactus', { title: 'Excessive - Contact Us' });
});

exports.renderAbout = catchAsync(async (req, res, next) => {
  res.status(200).render('aboutus', { title: 'Excessive - About Us' });
});

// * FUNCTIONS

exports.renderRatingStars = function (rating) {
  let strInnerHTML = '';

  for (let i = 1; i <= Math.floor(rating); i++) {
    strInnerHTML += `<i  class="fa-solid fa-star stars"></i>`;
  }
  if (rating > Math.floor(rating) && rating < Math.ceil(rating)) {
    strInnerHTML += `<i  class="fa-solid fa-star-half-stroke stars"></i>`;
  }
  if (rating <= 4) {
    for (let j = Math.ceil(rating); j < 5; j++) {
      strInnerHTML += `<i class="fa-regular fa-star stars"></i>`;
    }
  }

  return strInnerHTML;
};

exports.getUserSchemaKeys = () => {
  try {
    const keys = Object.keys(User.schema.paths);

    for (let i = 0; i < keys.length; i++) {
      if (
        keys[i].startsWith('metadata') ||
        keys[i].startsWith('_') ||
        keys[i].startsWith('photo') ||
        keys[i].startsWith('wishList') ||
        keys[i].startsWith('rated')
      ) {
        keys.splice(i, 1);
        i--;
      }
    }

    // return keys;

    let fields = '';
    keys
      .map((key) => {
        if (key == 'address') {
          fields += `<label for=${key}>${key
            .toLowerCase()
            .charAt(0)
            .toUpperCase()}${key.slice(1)}</label>
          <input class="form-input" type=${key} name=${key} id=${key}>
          <label for='zipcode'>Postal Code</label>
          <input class="form-input" type='text' name='zipcode' id='zipcode'>
          <label for="city">City</label>
          <input class="form-input" type="text" name="city" id="city">
          <label for="country">Country</label>
          <input class="form-input" type="text" name="country" id="country">`;
        } else if (key == 'password') {
          fields += `<label for=${key}>${key
            .toLowerCase()
            .charAt(0)
            .toUpperCase()}${key.slice(1)}</label>
          <input class="form-input" type=${key} name=${key} id=${key} required minlength="8">
          <label for=confirm-password>Confirm Password</label>
          <input class="form-input" type='password' name='confirm-password' id='confirm-password' required minlength="8"></input>`;
        } else {
          fields += `<label for=${key}>${key
            .toLowerCase()
            .charAt(0)
            .toUpperCase()}${key.slice(1)}</label>
          <input class="form-input" type=${key} name=${key} id=${key} required>`;
        }
      })
      .join('');
    // console.log(fields);
    return fields;
  } catch (error) {
    console.log(error.message, error.error);
  }
};
