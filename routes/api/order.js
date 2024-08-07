const express = require('express');

const router = express.Router();

const orderController = require('../../controllers/order');
const authController = require('../../middleware/auth');
const dealerAuthController = require('../../middleware/dealerAuth');

router.post('/', authController, orderController.addNewOrder);
router.get('/', authController, orderController.getCustomerOrders);
router.get('/dealer', dealerAuthController, orderController.getDealerOrders);
router.get('/customer', authController, orderController.getCustomerOrders);
router.put('/:id', authController, orderController.editCustomerOrder);
router.delete('/:id', authController, orderController.deleteOrder);

module.exports = router;