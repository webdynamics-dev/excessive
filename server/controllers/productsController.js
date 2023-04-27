/* eslint-disable comma-dangle */
/* eslint-disable max-len */
// 3RD PARTY
const slugify = require('slugify');
const multer = require('multer');
const sharp = require('sharp');

// INTERNAL
const catchAsync = require('../utils/catchErrors');

const { Product } = require('../models/productModel');
const { Archive } = require('../models/productArchiveModel');
const { Order } = require('../models/ordersModel');
const { User } = require('../models/userModel');

// CONTROLLERS

// * LIST ALL PRODUCTS
exports.listAllProducts = catchAsync(async (req, res, next) => {
  const products = await Product.find();
  res.status(200).json({
    status: 'success',
    products,
  });
  next();
});

// *LIST ONE PRODUCT
exports.listOneProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  res.status(200).json({
    status: 'success',
    data: product,
  });

  next();
});

// * CREATE NEW PRODUCT
exports.createNewProduct = catchAsync(async (req, res, next) => {
  try {
    const productData = { ...req.body };
    productData.slug = slugify(req.body.name, { lower: 'true' });

    const newProduct = await Product.create(productData);

    res.status(201).json({
      status: 'success',
      data: newProduct,
      message: 'Product successfully created',
    });

    next();
  } catch (error) {
    res.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
});

//* DELETE ONE PRODUCT BY ID - DOES NOT REALLY DELETE THE PRODUCT, INSTEAD IT MARKS IT AS ACTIVE=FALSES. THESE PRODUCTS SHOULD NOT BE LISTED ANYMORE IN THE OVERVIEW, DIFFERENT THAT THOSE WITH INVENTORY 0
exports.deleteProduct = catchAsync(async (req, res, next) => {
  const deletedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    { 'metadata.active': false, 'metadata.dateDeleted': new Date(Date.now()) },
    { new: true }
  );
  res.status(200).json({
    status: 'success',
    data: deletedProduct,
  });

  next();
});

//* ARCHIVE AND UPDATE PRODUCT BY ID

exports.updateProduct = catchAsync(async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    req.body['metadata.version'] = product.metadata.version + 1;
    req.body['metadata.lastUpdated'] = new Date(Date.now()).toUTCString();

    const archivedItem = new Archive();
    // archivedItem.dateArchived = new Date(Date.now());
    archivedItem.version = product.metadata.version;
    archivedItem.archivedData = { ...product };

    await Archive.create(archivedItem);

    // console.log(product.metadata.version);
    // console.log(req.body['metadata.version']);
    // console.log(req.body['metadata.lastUpdated']);

    // console.log(typeof req.body.ratings);

    const result = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    // console.log(`result: ${result}`);
    res.status(200).json({
      status: 'success',
      data: result,
      message: 'Product successfully updated',
    });

    next();
  } catch (error) {
    console.log(error);
  }
});

// * UPDATE PRODUCT INVENTORY

exports.updateProductInventory = catchAsync(async (req, res, next) => {
  const updatedInventory = Product.findByIdAndUpdate(req.body.id, {
    inventory: req.body.inventory,
  });

  if (updatedInventory) {
    res.status(200).json({
      status: 'success',
      message: 'Inventory successfully updated',
    });
  } else {
    res.status(400).json({
      status: 'fail',
      message: 'Something went wrong when updating product inventory',
    });
  }
});

// * RATE PRODUCTS

exports.addRating = catchAsync(async (req, res, next) => {
  if (req.body.user) {
    const orderExists = await Order.findOne({
      'items.productId': req.params.productId,
      userId: req.body.user._id,
    });

    if (!orderExists) {
      return res.status(403).json({
        status: 'fail',
        message:
          'We have no record of you having ordered this product. Product voting is allowed only for users that have ordered the specific item.',
      });
    }

    const checkRated = await User.findOne({
      _id: req.body.user._id,
      rated: req.params.productId,
    });

    if (checkRated) {
      return res.status(403).json({
        status: 'fail',
        message:
          'You have already rated this product. Only one rating per product is allowed.',
      });
    }

    try {
      const rating = await Product.findByIdAndUpdate(
        req.params.productId,
        {
          $push: { ratings: req.body.rating },
        },
        { new: true }
      );

      const updateUser = await User.findByIdAndUpdate(req.body.user._id, {
        $push: { rated: req.params.productId },
      });

      if (!rating || !updateUser) {
        return res.status(500).json({
          status: 'fail',
          message: 'Something went wrong when trying to submit your vote',
        });
      }

      res.status(200).json({
        status: 'success',
        message: 'Product rating successfully added to database',
      });
    } catch (err) {
      console.log(err);
    }
  } else {
    return res.status(401).json({
      status: 'fail',
      message: 'You need to be logged in to be able to rate products.',
    });
  }
});

// * RETURN PRODUCT SCHEMA DETAILS

exports.returnProductSchemaDetails = catchAsync(async (req, res, next) => {
  try {
    const productKeys = Object.keys(Product.schema.paths);

    res.status(200).json({
      status: 'success',
      keys: productKeys,
    });

    next();
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
});

// MULTER STORAGE

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'));
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

module.exports.uploadPhotos = upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'images', maxCount: 20 },
]);
// 'coverImage, images'-imeto na ovie parametri treba da e identicno so imeto na upload form polinjata

// *RESIZE, CONVERT, RENAME AND SAVE UPLOADED IMAGES TO MULTER MEMORY(ALSO REQ.FILES)
exports.handleUploadedFiles = catchAsync(async (req, res, next) => {
  if (req.files) {
    // console.log(req.body);
    let coverImageName;
    try {
      if (req.files.coverImage) {
        // req.body.coverImage = `cover-${req.params.id}-${Date.now()}.webp`;
        coverImageName = `cover-${Date.now()}.webp`;
        await sharp(req.files.coverImage[0].buffer)
          .rotate()
          .resize(
            1800,
            1000,
            {
              fit: 'inside',
              withoutEnlargement: true,
              background: { r: 0, g: 0, b: 0, alpha: 0 },
            } // if image's original width or height is less than specified width and height, sharp will do nothing(i.e no enlargement)
          )

          .toFormat('webp')
          .webp({ quality: 90, nearLossless: true })
          .toFile(`./public/images/${coverImageName}`);

        req.body.coverImage = coverImageName;
      }
      const imagesNames = [];

      if (req.files.images) {
        req.body.images = [];
        await Promise.all(
          req.files.images.map(async (image, i) => {
            const filename = `product-${Date.now()}-${i + 1}.webp`;
            imagesNames.push(filename);

            await sharp(image.buffer)
              .rotate()
              .resize(
                1800,
                1000,
                {
                  fit: 'inside',
                  withoutEnlargement: true,
                  background: { r: 0, g: 0, b: 0, alpha: 0 },
                } // if image's original width or height is less than specified width and height, sharp will do nothing(i.e no enlargement)
              )
              .toFormat('webp')
              .webp({ quality: 90, nearLossless: true })
              .toFile(`./public/images/${filename}`);

            req.body.images.push(filename);
          })
        );
        console.log(req.body.images);
      }

      res.status(201).json({
        status: 'success',
        images: imagesNames,
        coverImage: coverImageName,
      });

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

// TODO DA SE NAPRAVI FUNKCIJA ZA VRAKJANJE NA ARHIVIRANA VERZIJA DOKOLKU IMA POTREBA
