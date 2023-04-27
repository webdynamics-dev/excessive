const mongoose = require('mongoose');
const validator = require('validator');

const newsletterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: [validator.isEmail, 'Please provide valid email address'],
    trim: true,
  },
});

const Newsletter = mongoose.model('Newsletter', newsletterSchema);

module.exports.Newsletter = Newsletter;
