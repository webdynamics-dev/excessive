// IMPORT 3RD PARTY

const mongoose = require('mongoose');

// IMPORT INTERNAL
// const { Product } = require('../models/productModel');

const archiveSchema = new mongoose.Schema({
  version: {
    type: Number,
    required: true,
  },
  dateArchived: {
    type: Date,
    required: true,
    default: Date.now,
  },
  archivedData: { type: Object, required: true },
});

const Archive = mongoose.model('Archive', archiveSchema);

module.exports.Archive = Archive;
