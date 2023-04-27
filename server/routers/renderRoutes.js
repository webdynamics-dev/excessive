// 3RD PARTY IMPORTS
const express = require('express');

const router = express.Router();

// INTERNAL IMPORTS
// const productsController = require('../controllers/productsController');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const renderController = require('../controllers/renderController');

// ROUTES

router
  .route('/user/:id')
  .get(authController.isLoggedIn, renderController.getUser);

router.route('/').get(authController.isLoggedIn, renderController.getOverview);
router
  .route('/product/:slug')
  .get(authController.isLoggedIn, renderController.renderOneProduct);

router
  .route('/contact')
  .get(authController.isLoggedIn, renderController.renderContact);

router
  .route('/about')
  .get(authController.isLoggedIn, renderController.renderAbout);

router
  .route('/signup')
  .get(authController.isLoggedIn, renderController.renderSignup);
router
  .route('/login')
  .get(authController.isLoggedIn, renderController.renderLogin);

router
  .route('/cart')
  .get(authController.isLoggedIn, renderController.renderCart);

router
  .route('/order-result/:status/:orderId')
  .get(renderController.renderOrderResult);

router
  .route('/administrator')
  .get(
    authController.isLoggedIn,
    authController.protectRoute,
    renderController.renderAdministrator
  );

module.exports = router;
