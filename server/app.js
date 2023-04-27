// 3RD PARTY

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
// eslint-disable-next-line import/no-extraneous-dependencies
// const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');

const express = require('express');

const app = express();

const path = require('path');

const paypal = require('./paypal-api');

// INTERNAL

// ----------------------------------------------------------- //
const productsRouter = require('./routers/productsRoutes');

// const testRouter = require('./routers/testRoutes');
// ----------------------------------------------------------- //

// const authRouter = require('./routers/authRoutes');
const renderRouter = require('./routers/renderRoutes');
const usersRouter = require('./routers/usersRoutes');
const ordersRouter = require('./routers/ordersRoutes');
const newsletterRouter = require('./routers/newsletterRoutes');
const contactRouter = require('./routers/contactRoutes');

const {
  renderRatingStars,
  getUserSchemaKeys,
  isLoggedInRenderCheck,
} = require('./controllers/renderController');

// PUG SETTINGS

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, '../public')));
app.locals.renderRatingStars = renderRatingStars;
app.locals.getUserSchemaKeys = getUserSchemaKeys;
app.locals.isLoggedInRenderCheck = isLoggedInRenderCheck;

// GLOBAL MIDDLEWARE

app.use(cors());

// if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

app.use(bodyParser.raw());

app.use(express.json({ limit: '10kb' }));
// neophodno za da req bide popolnet so req.body data, vo sprotivno e undefined

app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

app.use(hpp());
app.use(compression());

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

// GENERAL ROUTE MIDDLEWARE

app.use('/', renderRouter);
app.use('/api/v1/users/', usersRouter);
app.use('/api/v1/products/', productsRouter);
app.use('/api/v1/orders/', ordersRouter);
app.use('/api/v1/newsletter/', newsletterRouter);
app.use('/api/v1/contact/', contactRouter);

// ! PAYPAL ROUTES

app.post('/api/orders', async (req, res) => {
  body = req.body;
  // console.log(req.body);
  try {
    const order = await paypal.createOrder(body);
    res.json(order);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post('/api/orders/:orderID/capture', async (req, res) => {
  const { orderID } = req.params;
  try {
    const captureData = await paypal.capturePayment(orderID);
    res.json(captureData);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// app.use('/api/v1/orders', ordersRouter);

// MULTER TESTING
// app.get('/', (req, res) => {
//   res.sendFile('./index.html');
// });
// app.use("/api/v1/products", productsRoutes.kurac);
// app.use("/api/v1/users", userController);

module.exports = app;
