const newsletterController = require('../controllers/newsletterController');

const express = require('express');
const router = express.Router();

router.route('/subscribe').post(newsletterController.subscribe);

router.route('/unsubscribe/:emailId').get(newsletterController.unsubscribe);

module.exports = router;
