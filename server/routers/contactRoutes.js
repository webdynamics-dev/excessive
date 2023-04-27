const express = require('express');

const router = express.Router();

// INTERNAL IMPORTS
// const productsController = require('../controllers/productsController');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const contactController = require('../controllers/contactController');

// ROUTES

router.route('/').post(contactController.submitQuestion);

module.exports = router;
