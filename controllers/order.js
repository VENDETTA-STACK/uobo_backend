const orderServices = require('../services/order');

module.exports = {
    addNewOrder: async (req, res, next) => {
        try {
            const params = req.body;
            const user = req.user;

            if (!user) {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Please provide valid authrized token' });
            }

            if (!params.carId) {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: 'Please provide valid carId' });
            }

            if (!params.status) {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: 'Please provide valid status' });
            }

            params.customerId = user._id;

            const orderData = await orderServices.addOrder(params);

            if (orderData) {
                return res.status(200).json({ IsSuccess: true, Data: [orderData], Message: 'Order added' });
            } else {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Order not added' });
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Message: error.message });
        }
    },

    getCustomerOrdersv1: async (req, res, next) => {
        try {
            const user = req.user;

            if (!user) {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Please provide valid authrized token' });
            }

            const customerOrders = await orderServices.getOrderByCustomerId(user._id);

            if (customerOrders.length) {
                return res.status(200).json({ 
                    IsSuccess: true,
                    Count: customerOrders.length,
                    Data: customerOrders, Message: "Customer orders found"
                });
            } else {
                return res.status(400).json({ IsSuccess: true, Data: [], Message: "Customer orders not found" });
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Message: error.message });
        }
    },

    getDealerOrders: async (req, res, next) => {
        try {
            const dealer = req.user;

            if (!dealer) {
                return res.status(401).json({ IsSuccess: false, Message: 'No dealer found' });
            }

            const orders = await orderServices.getOrderByDealerId(dealer._id);

            if (orders) {
                return res.status(200).json({ IsSuccess: true, Count: orders.length, Data: orders, Message: 'Dealer orders found' });
            } else {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Dealer orders not found' });
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Message: error.message });
        }
    },

    getCustomerOrders: async (req, res, next) => {
        try {
            const customer = req.user;

            if (!customer) {
                return res.status(401).json({ IsSuccess: false, Message: 'No customer found' });
            }

            const orders = await orderServices.getOrderByCustomerId(customer._id);

            if (orders.length) {
                return res.status(200).json({ 
                    IsSuccess: true, 
                    Count: orders.length, 
                    Data: orders, 
                    Message: 'Customer orders found' 
                });
            } else {
                return res.status(200).json({ IsSuccess: false, Data: [], Message: 'Customer orders not found' });
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Message: error.message });
        }
    },

    editCustomerOrder: async (req, res, next) => {
        try {
            const orderId = req.params.id;
            const status = req.body.status;
            const user = req.user;

            if (!user) {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Please provide valid authrized token' });
            }

            if (!status) {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: 'Please provide valid order status' });
            }

            const checkExistOrder = await orderServices.getOrderByOrderId(orderId);

            if (checkExistOrder) {
                let editOrder = await orderServices.editOrderStatus(status, orderId);

                if (editOrder) {
                    return res.status(200).json({ IsSuccess: true, Data: editOrder, Message: "Customer order status updated" });
                } else {
                    return res.status(400).json({ IsSuccess: false, Data: [], Message: "Customer order status not updated" });
                }
            } else {
                return res.status(400).json({ IsSuccess: true, Data: [], Message: "No order found" });
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Message: error.message });
        }
    },

    deleteOrder: async (req, res, next) => {
        try {
            const orderId = req.params.id;

            const user = req.user;

            if (!user) {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Please provide valid authrized token' });
            }

            let deleteOrder = await orderServices.deleteCustomerOrder(orderId);

            if (deleteOrder) {
                return res.status(200).json({ IsSuccess: true, Data: 1, Message: "Order deleted successfully" });
            } else {
                return res.status(400).json({ IsSuccess: false, Data: 0, Message: "Order not found" });
            }

        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Message: error.message });
        }
    }
}