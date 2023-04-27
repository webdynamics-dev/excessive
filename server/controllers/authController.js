/* eslint-disable comma-dangle */
// IMPORT 3RD PARTY
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// IMPORT INTERNAL
const catchAsync = require('../utils/catchErrors');
const { User } = require('../models/userModel');
const Email = require('../utils/emails');

// * ENCRYPT PASSWORD
exports.hashPassword = catchAsync(async (req, res, next) => {
  // console.log(req.body);
  if (!req.body.password) {
    return res
      .status(400)
      .json({ status: 'fail', message: 'Password is mandatory' });
  }

  req.body.password = await bcrypt.hash(req.body.password, 12);

  // res.status(200).json({
  //   status: 'success',
  //   message: hashPass,
  // });
  next();
});

// * SIGN JWT TOKEN
exports.generateJWTToken = (req, res, next) => {
  let data = {
    userId: req.body.userId, //!da se enkriptira!!!!!!!!!!!!!
  };

  try {
    const token = jwt.sign(data, process.env.JWT_SECRET, {
      expiresIn: '604800s',
    });

    res.cookie('jwt', token, {
      httpOnly: true,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    });
    res.status(200).json({
      status: 'success',
      message: 'User logged in succesfully',
      token,
    });
  } catch (error) {
    console.log(error.name, error.message);
  }

  next();
};

// * VERIFY JWT TOKEN
exports.verifyJWTToken = catchAsync(async (req, res, next) => {
  // console.log(req.headers.authorization);

  let token = '';

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  } else {
    return res.status(401).json({
      status: 'fail',
      message: 'User is not logged in. You need to login first',
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
    if (err) {
      return res.status(401).json({
        status: 'fail',
        // decoded: decoded,
        message: 'Invalid token.',
      });
    }
    req.body.userId = decoded.userId;
    // console.log(decoded.userId);

    next();
  });
});

// * DETECT ROLE AND PROTECT ROUTES
exports.protectRoute = catchAsync(async (req, res, next) => {
  if (req.body.userId) {
    const userRole = await User.findOne({ _id: req.body.userId }).select(
      'metadata.role'
    );

    req.body.role = userRole.metadata.role;
    // console.log(userRole.role);
    // console.log(userRole);
    if (userRole.metadata.role !== 'admin') {
      return res.status(401).json({
        status: 'fail',
        message: 'Unauthorized user for this path.',
      });
    }

    next();
  } else {
    return res.status(401).json({
      status: 'fail',
      message: 'User not logged in!',
    });
  }
});

// * IS LOGGED IN MIDDLEWARE
exports.isLoggedIn = catchAsync(async (req, res, next) => {
  let token = '';

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  // else {
  //   return res.status(401).json({
  //     status: 'fail',
  //     message: 'User is not logged in. You need to login first',
  //   });
  // }

  if (token) {
    // VALIDATE COOKIE TOKEN

    jwt.verify(token, process.env.JWT_SECRET, async function (err, decoded) {
      if (err) {
        console.log(err);
        return next();
      }

      // check if user exists in database
      const loggedUser = await User.findById(decoded.userId).select(
        '-password'
      );

      if (!loggedUser) {
        res.locals.user = undefined;
        res.locals.role = undefined;
        return next();
      } else {
        // console.log(loggedUser.changedPasswordAfter(decoded.iat));
        if (loggedUser.changedPasswordAfter(decoded.iat)) {
          res.locals.user = undefined;
          res.locals.role = undefined;
        } else {
          // IF TOKEN VALID AND USER EXISTS IN DB
          res.locals.user = decoded.userId;
          req.body.userId = decoded.userId;
          res.locals.role = loggedUser.metadata.role;
          req.body.user = loggedUser;
          res.locals.userData = loggedUser;
        }
        // console.log(res.locals.user);
      }

      // ! DA SE VMETNE PROVERKA ZA PASSWORD CHANGED AT

      next();
    });
  } else {
    res.locals.user = undefined;
    res.locals.role = undefined;
    next();
  }
});

// * CREATE RESET PASSWORD TOKEN
exports.createResetToken = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  // console.log(user);

  if (!user) {
    res.status(400).json({
      status: 'fail',
      message: 'Wrong user email',
    });
    // return next();
  } else if (user) {
    const resetToken = user.createPassResetToken();

    user.save();

    try {
      const resetURL = `${req.protocol}://${req.get(
        'host'
      )}/api/v1/users/resetpasswordwindow/${resetToken}`;

      await new Email(user, resetURL).sendPasswordReset();

      res.status(200).json({
        status: 'success',
        message:
          'Instructions for resetting your password have been sent to your email',
      });
    } catch (err) {
      user.metadata.passwordResetToken = undefined;
      user.metadata.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      console.log(err);

      res.status(500).json({
        status: 'fail',
        message:
          'Something went wrong when sending the instructions email. Contact the administrator immediatelly',
      });

      // return next();
    }

    // next();
  }
});

// * FIND USER ACCORDING TO TOKEN AND RETURN RESET PASS WINDOW
exports.resetPasswordWindow = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    'metadata.passwordResetToken': hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select('_id email');

  // console.log(user);

  if (user) {
    res.status(200).render('resetpassword', { user: user });
  } else {
    res.status(401).render('randommessages', {
      status: 'Failed!',
      message: 'Invalid reset token or token validity expired.',
    });
    // .json({
    //   status: 'fail',
    //   message: 'Invalid reset token or token validity expired',
    // });
  }

  next();
});

// * FINALLY RESET PASSWORD
exports.resetUserPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const result = await User.findOneAndUpdate(
    { 'metadata.passwordResetToken': hashedToken },
    {
      password: req.body.password,
      'metadata.passwordChangedAt': Date.now(),
      'metadata.passwordResetToken': null,
      'metadata.passwordResetExpires': null,
    }
  );

  if (result) {
    res.status(200).json({
      status: 'success',
      message:
        'Password successfully updated. Please login with your new password.',
    });
  } else {
    res.status(500).json({
      status: 'fail',
      message: 'Something went wrong. Please try again later.',
    });
  }
  next();
});
