// 3RD PARTY IMPORTS
const express = require('express');
const router = express.Router();

// INTERNAL IMPORTS
const ordersController = require('../controllers/ordersController');
const authController = require('../controllers/authController');

router
  .route('/')
  .post(
    authController.isLoggedIn,
    ordersController.matchPrice,
    ordersController.placeNewOrder
  );

router
  .route('/shipped')
  .post(
    authController.isLoggedIn,
    authController.protectRoute,
    ordersController.markAsShipped
  );

module.exports = router;
