// 3RD PARTY
const mongoose = require('mongoose');
const validator = require('validator');

// IMPORT INTERNAL
// const Archive = require('../models/productArchiveModel');

// SCHEMA
const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], minlength: 10 },
    desc: {
      type: String,
      required: [true, 'Product description is required'],
      minlength: 30,
    },
    coverImage: String,
    images: [String],
    price: { type: Number, required: true },
    category: {
      type: String,
      required: true,
      enum: {
        values: ['Earrings', 'Bracelets', 'Necklaces', 'Rings'], //DA SE ADAPTIRA SOODVETNO
        message: 'Value must be one of enum types',
      },
    },
    // variants: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   // ref: Product,
    // },
    material: { type: [String] },
    slug: { type: String, required: true, unique: true },
    inventory: { type: Number, required: true, default: 1 },
    metadata: {
      version: { type: Number, required: true, default: 1 },
      lastUpdated: { type: Date, default: Date.now },
      active: { type: Boolean, default: true },
      dateDeleted: { type: Date },
    },
    ratings: { type: [Number] },
    currency: {
      type: String,
      enum: ['USD', 'EUR', 'MKD'],
      required: true,
      default: 'MKD',
    },
    comments: { type: [String] },
    productGroup: { type: [String] },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

ProductSchema.virtual('ratingsAvg').get(function () {
  if (this.ratings.length > 0) {
    return this.ratings.reduce(function (a, b) {
      return (a + b) / 2;
    });
  }
});

// ProductSchema.pre('save', function () {
//   console.log('PRE-SAVE');

//   if (this.isNew && this.variants) {
//     // console.log(this._id);
//     let id = this._id;
//     this.variants.map(async function (variant) {
//       const productVariant = await Product.updateOne(
//         { _id: variant },
//         { $push: { variants: id } }
//       );
//     });
//   }
// });

// ProductSchema.pre('updateOne', async function () {
//   console.log('PRE-UPDATEONE');

//   // console.log(this);
//   if (this.isModified('variants')) {
//     console.log('variants modified');
//   }
// });

// // TODO DA SE DORABOTI ZA OTFRLANJE NA VARIJANTA

const Product = mongoose.model('Product', ProductSchema);

module.exports.Product = Product;
