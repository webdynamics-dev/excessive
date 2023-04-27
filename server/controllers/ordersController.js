// INTERNAL REQUESTS
const { Order } = require('../models/ordersModel');
const catchAsync = require('../utils/catchErrors');

// TODO DA SE DORABOTI OKOLU KREIRANJETO NA NARACKITE I PLAKJANJETO
exports.placeNewOrder = catchAsync(async (req, res, next) => {
  try {
    const newOrder = await Order.create(req.body);

    if (newOrder) {
      res.status(201).json({
        status: 'success',
        order: newOrder,
      });
      next();
    } else {
      return res.status(400).json({
        status: 'fail',
        error: 'Something went wrong',
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: 'fail',
      error: error.message,
    });
  }
});

exports.matchPrice = catchAsync(async (req, res, next) => {
  let totalAmount = [];

  req.body.items.map((item) => {
    let totalItemCost = item.amount * item.unitPrice;
    totalAmount.push(totalItemCost);
  });

  const totalAmountReduced = totalAmount.reduce((a, b) => {
    return a + b;
  });

  // console.log(totalAmountReduced, req.body.paypalAmount);
  if (totalAmountReduced * 1 !== req.body.paypalAmount * 1) {
    req.body.transactionFlag = 'FLAGGED TRANSACTION';
  } else {
    req.body.transactionFlag = 'none';
  }
  next();
});

exports.markAsShipped = catchAsync(async (req, res, next) => {
  try {
    const orderShipped = await Order.findByIdAndUpdate(
      req.body.id,
      {
        shipped: req.body.shipped,
        trackingNumber: req.body.trackingNumber,
        dateShipped: req.body.dateShipped,
      },
      { new: true }
    );
    res.status(200).json({
      status: 'success',
      result: orderShipped,
    });
  } catch (error) {
    res.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
});
