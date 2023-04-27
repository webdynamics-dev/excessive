const mongoose = require('mongoose');
const { User } = require('../models/userModel');
const { Product } = require('../models/productModel');

const orderSchema = new mongoose.Schema(
  {
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: Product,
        },
        productVersion: { type: Number, required: true },
        amount: { type: Number, min: 1, required: true },
        unitPrice: { type: Number, required: true },
      },
    ],
    dateOrdered: { type: Date, default: Date.now, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: User }, //!objectid validacijata ne funkcionira, da se provery type

    name: { type: String, required: [true, 'Name field is required'] },
    address: { type: String, required: [true, 'Address field is required'] },
    zipcode: { type: Number, required: [true, 'ZipCode field is required'] },
    city: { type: String, required: [true, 'City field is required'] },
    country: { type: String, required: [true, 'Country field is required'] },
    telephone: {
      type: String,
      required: [true, 'Telephone field is required'],
    },
    // address: { type: String, required: true },
    // paymentMethod: { type: String, required: true },
    shippingCost: { type: Number, default: 0 },
    paypalResult: { type: String, required: true },
    paypalTransactionId: { type: String, required: true, unique: true },
    paypalAmount: { type: Number },
    paypalCurrency: { type: String, enum: ['USD', 'MKD', 'EUR'] },
    paypalFee: { type: Number },
    paypalNetAmount: { type: Number },
    paypalLinks: Array,
    paypalPayerId: { type: String },
    transactionFlag: { type: String },
    shipped: { type: Boolean, required: true, default: false },
    trackingNumber: { type: String },
    dateShipped: { type: Date },
    cancelled: { type: Boolean, default: false },
    cancelledReason: { type: String },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

orderSchema.post('save', (doc) => {
  const itemsArray = [];
  try {
    doc.items.map((item) => {
      itemsArray.push({ id: item.productId, amount: item.amount });
      return itemsArray;
    });

    itemsArray.forEach(async (item) => {
      const result = await Product.findByIdAndUpdate(
        item.id,
        {
          $inc: { inventory: -item.amount * 1 },
        },
        { new: true }
      );

      // console.log(result);
    });
  } catch (error) {
    console.log(error);
    return new mongoose.Error.ValidationError(error);
  }
});
// orderSchema.virtual('totalPaid').get(function () {
//   let sum = 0;
//   let total = this.items.map((item) => {
//     sum = sum + item.amount;
//   });

//   return { itemsCost: sum, totalCost: sum + this.shippingCost };
// });

const Order = mongoose.model('Order', orderSchema);

module.exports.Order = Order;
