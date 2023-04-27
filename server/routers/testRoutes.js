// IMPORT 3RD PARTY
const express = require('express');

const router = express.Router();

// INTERNAL IMPORTS
const authController = require('../controllers/authController');

// ! TEST ROUTES

// router.route('/hashPassword').post(authController.hashPassword);

// router.route('/logintest').post(authController.loginUser);

// router.route('/signtoken').post(authController.generateJWTToken);

// router.route('/verifytoken').post(authController.verifyJWTToken);

router
  .route('/decode')
  .post(
    authController.verifyJWTToken,
    authController.protectRoute,
    authController.endTestRoute
  );

module.exports = router;
