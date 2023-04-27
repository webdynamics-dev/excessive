// IMPORT 3RD PARTY
const express = require('express');

const router = express.Router();

// INTERNAL IMPORTS
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
// const renderController = require('../controllers/renderController');

router
  .route('/login')
  .post(userController.loginUser, authController.generateJWTToken);

router.route('/logout').post(userController.logoutUser);

router
  .route('/updatepassword/:id')
  .patch(
    authController.isLoggedIn,
    userController.checkPassword,
    authController.hashPassword,
    userController.updateUser
  );

// ! FORGOT PASSWORD LINK
router.route('/forgotpassword').patch(authController.createResetToken);

// ! RESET PASSWORD WINDOW
router
  .route('/resetpasswordwindow/:token')
  .get(authController.resetPasswordWindow);

// ! FINALLY RESET PASSWORD
router
  .route('/resetpassword/:resettoken')
  .patch(authController.hashPassword, authController.resetUserPassword);

router
  .route('/signup')
  .post(
    userController.checkExistingUser,
    authController.hashPassword,
    userController.registerNewUser
  );

router.route('/confirmuseremail/:token').get(userController.confirmUserEmail);

router
  .route('/:id')
  .delete(
    authController.isLoggedIn,
    authController.protectRoute,
    userController.deleteUser
  );

router.route('/').get(userController.listActiveUsers);

router
  .route('/deleted')
  .get(
    authController.isLoggedIn,
    authController.protectRoute,
    userController.listDeletedUsers
  );

router
  .route('/uploadphoto/:id')
  .patch(
    authController.isLoggedIn,
    userController.uploadUserPhoto,
    userController.handleUserPhoto,
    userController.updateUserPhoto
  );

router
  .route('/:id')
  .patch(authController.isLoggedIn, userController.updateUser);

router
  .route('/wishlist/:productId')
  .patch(authController.isLoggedIn, userController.updateWishlist);

module.exports = router;
