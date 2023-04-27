// 3RD PARTY

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

// import * as paypal from './paypal-api.js';

// INTERNAL

const app = require('./app');

// DB CONNECTION

// mongoose
//   .connect('mongodb://127.0.0.1:27017/e-commerce', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.info('INFO: Connected to MongoDB...'))
//   .catch((error) => console.error(error));

mongoose
  .connect(process.env.DB_LINK, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.info('INFO: Connected to MongoDB...'))
  .catch((error) => console.error(error));

// HTTP SERVER DETAILS

const port = process.env.PORT || 5000;

const server = app.listen(port, () => {
  console.info(`INFO: Server started successfuly at port ${port}...`);
});

// ERROR HANDLING

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  server.close();
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  server.close();
  process.exit(1);
});

module.exports = mongoose;
