const express = require('express');
const router = express.Router();
const externalOrderController = require('../controllers/externalOrderController');

// POST extended order from external source (Website -> CRM)
router.post('/order', externalOrderController.createOrder);

module.exports = router;
