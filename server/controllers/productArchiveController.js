// IMPORT 3RD PARTY

const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');

// IMPORT INTERNAL
const catchAsync = require('../utils/catchErrors');
const { Archive } = require('../models/productArchiveModel');

exports.listProductArchive = catchAsync(async (req, res, next) => {
  try {
    const archivedProductData = await Archive.find({
      'archivedData._id': new ObjectId(req.params.id), //SITE OVIE ZAEBANCII ZATOA SHTO TIPOT NA KEY E OBJECTID
    });

    res.status(200).json({
      status: 'success',
      documents: archivedProductData.length,
      data: archivedProductData,
    });

    next();
  } catch (error) {
    res.status(500).json({
      status: 'fail',
      data: error.message,
    });
  }
});

exports.listSpecificArchiveVersion = catchAsync(async (req, res, next) => {
  try {
    const result = await Archive.find({
      'archivedData._id': new ObjectId(req.params.id),
      version: req.params.version,
    });

    res.status(200).json({
      status: 'success',
      data: result,
    });

    next();
  } catch (error) {
    res.status(500).json({
      status: 'fail',
      data: error.message,
    });
  }
});
