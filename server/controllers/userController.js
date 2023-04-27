/* eslint-disable comma-dangle */
// IMPORT INTERNAL
const { User } = require('../models/userModel');
const catchAsync = require('../utils/catchErrors');
const Email = require('./../utils/emails');

// IMPORT 3RD PARTY
const multer = require('multer');
const sharp = require('sharp');
const crypto = require('crypto');
const { ObjectId } = require('mongodb');

// * CHANGE USER PHOTO

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'));
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

module.exports.uploadUserPhoto = upload.fields([
  { name: 'photo', maxCount: 1 },

  // 'photo'-imeto na ovie parametri treba da e identicno so imeto na upload form polinjata
]);

// *RESIZE, CONVERT, RENAME AND SAVE UPLOADED IMAGES TO MULTER MEMORY(ALSO REQ.FILES)
exports.handleUserPhoto = catchAsync(async (req, res, next) => {
  if (req.files) {
    // console.log(req.body);
    let photoName;
    try {
      if (req.files.photo) {
        // req.body.coverImage = `cover-${req.params.id}-${Date.now()}.webp`;
        photoName = `photo-${Date.now()}.webp`;
        await sharp(req.files.photo[0].buffer)
          .resize(
            400,
            400,
            {
              fit: sharp.fit.inside,
              withoutEnlargement: true,
            } // if image's original width or height is less than specified width and height, sharp will do nothing(i.e no enlargement)
          )
          .toFormat('webp')
          .webp({ quality: 90, nearLossless: true })
          .toFile(`./public/user-images/${photoName}`);

        req.body.photo = photoName;
        // console.log(req.body.coverImage);
      }

      next();
    } catch (error) {
      res.status(500).json({
        status: 'fail',
        error: error.message,
      });
      console.log(error);
    }
  } else {
    next();
  }
});

// * CHECK IF USER EXISTS
exports.checkExistingUser = catchAsync(async (req, res, next) => {
  const existingUser = await User.findOne({ email: req.body.email });

  if (existingUser) {
    return res.status(400).json({
      status: 'fail',
      message: 'User with that email is already registered!',
    });
  }

  next();
});

// * REGISTER NEW USER
exports.registerNewUser = catchAsync(async (req, res, next) => {
  const token = crypto.randomBytes(32).toString('hex');

  req.body['metadata.confirmEmailToken'] = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const newUser = await User.create(req.body);

  // res.status(201).json({
  //   status: 'success',
  //   message: 'New user registered successfuly',
  //   userId: newUser._id,
  //   // user: newUser,
  // });

  // ! send email for email verification with 'token', not 'confirmEmailToken'

  try {
    const confirmURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/confirmuseremail/${token}`;

    // console.log(confirmURL);
    // console.log(newUser.firstName);
    // console.log(confirmURL)
    await new Email(newUser, confirmURL).sendWelcome();

    res.status(200).json({
      status: 'success',
      message:
        'New user registered successfuly. Instructions for completing your registration have been sent to your email',
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: 'fail',
      message:
        'Something went wrong when sending the confirmation email. Contact the administrator immediatelly',
    });
    return next();
  }

  next();
});

exports.confirmUserEmail = catchAsync(async (req, res, next) => {
  // console.log(req.params.token);

  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  // console.log(hashedToken);

  const activateUser = await User.findOneAndUpdate(
    { 'metadata.confirmEmailToken': hashedToken },
    {
      'metadata.status': 'active',
      'metadata.confirmEmailToken': null,
    },
    { new: true }
  );

  // console.log(activateUser);

  if (!activateUser) {
    res.status(400).render('randommessages', {
      status: 'Failed!',
      message: 'No such user found or invalid link.',
    });
    // json({
    //   status: 'fail',
    //   message: 'No such user found or invalid link.',
    // });
  } else {
    res.status(200).render('randommessages', {
      status: 'Success!',
      message: 'Account succesfully activated, you may now proceed to login.',
    });
    // json({
    //   status: 'success',
    //   message: 'User succesfully activated, you may now proceed to login.',
    // });
  }

  next();
});

// * UPDATE USER PHOTO
exports.updateUserPhoto = catchAsync(async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        photo: req.body.photo,
      },
      { new: true }
    );

    res.status(200).json({
      status: 'success',
      user: user,
    });
  } catch (error) {
    res.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
});

// * UPDATE USER
exports.updateUser = catchAsync(async (req, res, next) => {
  delete req.body.currentPass;

  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (user) {
      res.status(200).json({
        status: 'success',
        user: user,
      });
    } else {
      res.status(400).json({
        status: 'fail',
        message: 'No user found',
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
});

exports.updateWishlist = catchAsync(async (req, res, next) => {
  if (req.body.user) {
    const wishItem = req.body.user.wishList.find((product) => {
      return product == req.params.productId;
    });

    // console.log(wishItem);

    if (wishItem) {
      // console.log('da');
      try {
        const test = await User.findByIdAndUpdate(
          req.body.user._id,
          { $pull: { wishList: req.params.productId } },
          { new: true }
        );
      } catch (err) {
        console.log(err);
        res.status(500).json({
          status: 'fail',
          message: 'Something went wrong!',
        });
      }
      res.status(200).json({
        status: 'success',
        message: 'Product successfully removed from your wish list.',
        inList: false,
      });
    } else {
      // console.log('ne');
      try {
        const test = await User.findByIdAndUpdate(
          req.body.user._id,
          { $push: { wishList: req.params.productId } },
          { new: true }
        );
      } catch (err) {
        console.log(err);
        res.status(500).json({
          status: 'fail',
          message: 'Something went wrong!',
        });
      }
      res.status(200).json({
        status: 'success',
        message: 'Product successfully added to your wish list.',
        inList: true,
      });
    }
  } else {
    return res.status(401).json({
      status: 'fail',
      message:
        'You need to be logged in to be able to add products to your wish list.',
    });
  }
});

// * CHECK PASSWORD
exports.checkPassword = catchAsync(async (req, res, next) => {
  const findUser = await User.findById(req.params.id).select('email password');

  if (
    !findUser ||
    !(await findUser.comparePasswords(req.body.currentPass, findUser.password))
  ) {
    // return next(new Error('Invalid username or password'));
    res.status(401).json({
      status: 'fail',
      message: 'Invalid username or password.',
    });

    // next(new Error('Invalid username or password.'));
  } else {
    req.body.userId = findUser._id;

    next();
  }
});

// * LOGIN USER
exports.loginUser = catchAsync(async (req, res, next) => {
  const findUser = await User.findOne({ email: req.body.email }).select(
    'email password metadata.status'
  );
  // ! SELECT OPCIJATA GI VRAKJA SAMO DEFINIRANITE POLINJA, SITE DRUGI OD DOKUMENTOT NE SE DOSTAPNI (CONSOLE.LOG PRIMER)
  // console.log(findUser.password, findUser.photo);
  console.log(findUser.metadata.status);
  if (
    !findUser ||
    !(await findUser.comparePasswords(req.body.password, findUser.password))
  ) {
    // return next(new Error('Invalid username or password'));
    res.status(400).json({
      status: 'fail',
      message: 'Invalid username or password.',
    });

    // next(new Error('Invalid username or password.'));
  } else {
    if (findUser.metadata.status) {
      if (findUser.metadata.status === 'pending') {
        res.status(401).json({
          status: 'fail',
          message:
            'Acount not yet activated. You need to confirm your email before you can login.',
        });
      } else if (findUser.metadata.status === 'active') {
        req.body.userId = findUser._id;

        next();
      }
    } else if (!findUser.metadata.status) {
      res.status(400).json({
        status: 'fail',
        message:
          'Something went wrong! Contact the administrator immediatelly.',
      });
    }
  }
});

// *LOGOUT USER
exports.logoutUser = catchAsync(async (req, res, next) => {
  res.cookie('jwt', 'invalid', {
    expires: new Date(Date.now() + 1000),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    // TODO ova da se proveri shto znaci ovaa sintaksa
  });

  res.status(200).json({
    status: 'success',
    message: 'User successfuly logged out',
  });
});

// * DELETE USER
exports.deleteUser = catchAsync(async (req, res, next) => {
  const deleted = await User.findOneAndUpdate(
    { _id: req.params.id, 'metadata.active': true },
    {
      'metadata.active': false,
    }
  );
  // console.log(deleted);

  if (!deleted) {
    return res.status(400).json({
      status: 'fail',
      message: 'User with that id does not exist',
    });
  } else {
    res.status(200).json({
      status: 'success',
      message: `User with id ${req.params.id} successfully deleted!`,
    });
  }
});

//! -----------------------------------------------------------//
// * DELETE ALL USERS !!!!!!!!!

exports.deleteAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  if (users.length > 0) {
    await User.deleteMany();
    res.status(204).json({
      status: 'success',
    });
    console.log('deleted all users');
  } else {
    res.status(400).json({
      status: 'fail',
      message: 'No users found and deleted',
    });
  }
});
//! -----------------------------------------------------------//

// * LIST ALL ACTIVE (NOT DELETED) USERS
exports.listActiveUsers = catchAsync(async (req, res, next) => {
  const activeUsers = await User.find({ 'metadata.active': true });
  if (activeUsers.length === 0) {
    return res.status(400).json({
      status: 'fail',
      message: 'No users found in database',
    });
  } else {
    res.status(200).json({
      status: 'success',
      users: activeUsers.length,
      data: activeUsers,
    });

    next();
  }
});

// * LIST ALL DELETED USERS
exports.listDeletedUsers = catchAsync(async (req, res, next) => {
  const deletedUsers = await User.find({ 'metadata.active': false });
  if (deletedUsers.length === 0) {
    return res.status(400).json({
      status: 'fail',
      message: 'No deleted users found in database',
    });
  } else {
    res.status(200).json({
      status: 'success',
      users: deletedUsers.length,
      data: deletedUsers,
    });

    next();
  }
});
