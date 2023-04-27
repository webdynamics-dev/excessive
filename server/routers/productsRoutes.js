// 3RD PARTY IMPORTS
const express = require('express');

const router = express.Router();

// INTERNAL
const productsController = require('../controllers/productsController');
const productArchiveController = require('../controllers/productArchiveController');
const authController = require('../controllers/authController');

// ROUTES

router
  .route('/newproduct')
  .post(
    authController.isLoggedIn,
    authController.protectRoute,
    productsController.createNewProduct
  );

router.route('/').get(productsController.listAllProducts);
router
  .route('/productkeys')
  .get(
    authController.isLoggedIn,
    authController.protectRoute,
    productsController.returnProductSchemaDetails
  );

router
  .route('/product/:id')
  .get(productsController.listOneProduct)
  .delete(
    authController.isLoggedIn,
    authController.protectRoute,
    productsController.deleteProduct
  )
  .patch(
    authController.isLoggedIn,
    authController.protectRoute,
    // productsController.uploadPhotos,
    // productsController.handleUploadedFiles,
    productsController.updateProduct
  );

router
  .route('/rating/product/:productId')
  .patch(authController.isLoggedIn, productsController.addRating);

router
  .route('/productimages')
  .patch(
    authController.isLoggedIn,
    authController.protectRoute,
    productsController.uploadPhotos,
    productsController.handleUploadedFiles
  )
  .post(
    authController.isLoggedIn,
    authController.protectRoute,
    productsController.uploadPhotos,
    productsController.handleUploadedFiles
  );

router.route('/archived/:id').get(productArchiveController.listProductArchive);
router
  .route('/archived/:id/:version')
  .get(productArchiveController.listSpecificArchiveVersion);

//! MULTER ROUTE

// router.route('/uploadimages/:id').post(
//   authController.isLoggedIn,
//   authController.protectRoute,
//   productsController.uploadPhotos,
//   productsController.handleUploadedFiles,
//   productsController.updateProduct
// treba da se prepravi route-ot da vklucuva product id namesto /uploadmultiple
// );

module.exports = router;
