/* eslint-disable comma-dangle */
/* eslint-disable no-useless-escape */
// IMPORT 3RD PARTY
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { Product } = require('../models/productModel');
// const { Order } = require('../models/ordersModel');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Name is mandatory'],
    minlength: [3, 'Min name length is 3 characters'],
  },
  lastName: {
    type: String,
    required: [true, 'Name is mandatory'],
    minlength: [3, 'Min name length is 3 characters'],
  },
  email: {
    type: String,
    required: [true, 'email is mandatory'],
    lowercase: true,
    unique: true,
    validate: [validator.isEmail, 'Please provide valid email.'],
    trim: true,
  },
  password: {
    type: String,
    minlength: [8, 'Minlength for passwords is 8 characters'],
    select: false,
    required: true,
  },

  photo: {
    type: String,
    default: 'default.jpg',
  },
  address: {
    type: String,
    required: [true, 'Address is required for product delivery purposes'],
  },
  wishList: [{ type: mongoose.Schema.Types.ObjectId, ref: Product }],
  rated: [{ type: mongoose.Schema.Types.ObjectId, ref: Product }],

  metadata: {
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
    dateRegistered: { type: Date, default: Date.now(), required: true },
    dateDeleted: { type: Date },
    passwordChangedAt: { type: Date },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    role: {
      type: String,
      enum: { values: ['admin', 'user'], message: 'Wrong user role!' },
      required: true,
      default: 'user',
      trim: true,
    },
    status: {
      type: String,
      enum: { values: ['pending', 'active'], message: 'Wrong user status!' },
      required: true,
      default: 'pending',
      trim: true,
    },
    confirmEmailToken: { type: String },
  },
});

userSchema.methods.comparePasswords = async function (
  testedPassword,
  storedPassword
) {
  return await bcrypt.compare(testedPassword, storedPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.metadata.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.metadata.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

userSchema.methods.createPassResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.metadata.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // console.log({ resetToken }, this.passwordResetToken);

  this.metadata.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports.User = User;
