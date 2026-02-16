const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.post('/', orderController.createOrder);
router.post('/:orderId/estimate', orderController.createEstimate);
router.post('/:orderId/dispatch', orderController.markDispatched);

module.exports = router;
