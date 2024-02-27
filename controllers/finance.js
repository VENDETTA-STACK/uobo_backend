const { trusted } = require('mongoose');
const financeService = require('../services/finance');

module.exports = {
    addCustomerFinanceDetails: async (req, res, next) => {
        try {
            const params = req.body;

            const user = req.user;

            if (!user) {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Please provide valid authrized token' });
            }

            if (!params.carType) {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: "carType is required parameter" });
            }

            if (!params.preference) {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: "preference is required parameter" });
            }

            if (!params.make) {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: "make is required parameter" });
            }
            
            if (!params.model) {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: "model is required parameter" });
            }

            if (!params.priceRange) {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: "priceRange is required parameter" });
            }

            if (!params.address1) {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: "Address1 is required parameter" });
            }

            if (!params.address2) {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: "Address2 is required parameter" });
            }

            if (!params.postcode) {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: "Postcode is required parameter" });
            }

            params.userId = user._id;

            let addNewFinance = await financeService.addCustomerFinance(params);

            if (addNewFinance) {
                let editUserDetails = await financeService.editUserFinanceDetails(params);
                return res.status(200).json({ IsSuccess: true, Data: [addNewFinance], Message: 'User finance added' });
            } else {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'User finance not added' });
            }

        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Message: error.message });
        }
    },

    addCustomerFinanceCashFlow: async (req, res, next) => {
        try {
            const params = req.body;
            const customer = req.user;

            if (!params.dealerId) {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: 'Please provide dealerId' });
            }

            if (!customer._id) {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: 'Please provide customerId' });
            }

            if (!params.carId) {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: 'Please provide carId' });
            }

            let addFinance = await financeService.addCustomerCashFinance(params, customer);

            if (addFinance) {
                return res.status(200).json({ IsSuccess: true, Data: [addFinance], Message: 'Customer cash finance added' });
            } else {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Customer cash finance not added' });
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Data: [], Message: error.message });
        }
    },

    addCustomerFinanceFixFlow: async (req, res, next) => {
        try {
            const params = req.body;

            if (!dealerId) {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: 'Please provide dealerId' });
            }

            if (!customerId) {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: 'Please provide customerId' });
            }

            if (!carId) {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: 'Please provide carId' });
            }

            let addFinance = await financeService.addCustomerFixFinance(params);

            if (addFinance) {
                return res.status(200).json({ IsSuccess: true, Data: [addFinance], Message: 'Customer fix finance added' });
            } else {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Customer fix finance not added' });
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Data: [], Message: error.message });
        }
    },

    editCustomerFinanceStatus: async (req, res, next) => {
        try {
            const params = req.body;

            if (params.status === 'CustomerPaidFullInCash') {
                let editStatus = await financeService.editFinanceStatus(params);

                if (editStatus) {
                    return res.status(200).json({ IsSuccess: true, Data: editStatus, Message: `Finance status updated ${params.status}` });
                } else {
                    return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Finance status not updated' });
                }
            }

            if (!params.confirmAvailabilty) {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: 'Please provide confirmAvailabilty parameter' });
            }

            if (!params.financeId) {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: 'Please provide financeId parameter' });
            }

            let finance = await financeService.getFinanceById(params.financeId);

            if (finance === undefined || finance === null) {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Requested cash finance not found' });
            }

            if (params.confirmAvailabilty === true) {
                if (!params.status) {
                    return res.status(401).json({ IsSuccess: false, Data: [], Message: 'Please provide status parameter' });
                }
    
                if (!params.tradeInCarValue) {
                    return res.status(401).json({ IsSuccess: false, Data: [], Message: 'Please provide tradeInCarValue parameter' });
                }
    
                if (!params.appointments) {
                    return res.status(401).json({ IsSuccess: false, Data: [], Message: 'Please provide appointments parameter' });
                }

                let editStatus = await financeService.editFinanceStatus(params);

                if (editStatus) {
                    return res.status(200).json({ IsSuccess: true, Data: editStatus, Message: `Finance status updated ${params.status}` });
                } else {
                    return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Finance status not updated' });
                }
            } else {
                let deleteFinance = await financeService.deleteFinanceOrder(params.financeId);

                return res.status(200).json({  IsSuccess: true, Data: [], Message: 'Customer requested finance deleted'});
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Data: [], Message: error.message });
        }
    },

    getCustomerFinance: async (req, res, next) => {
        try {
            const user = req.user;

            if (!user) {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Please provide valid authrized token' });
            }

            let finance = await financeService.getUserFinanceDetails(user._id);

            if (finance) {
                return res.status(200).json({ IsSuccess: true, Data: finance, Message: 'User finance details found' });
            } else {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'No finance details found' });
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Message: error.message });
        }
    },

    addMortgageCategory: async (req, res, next) => {
        try {
            const typeList = req.body.mortgageList;

            if (!typeList.length) {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: 'Please provide valid list of data' });
            } 

            let addCategory = await financeService.addMortgageTypes(typeList);

            if (addCategory.length) {
                return res.status(200).json({ IsSuccess: true, Data: addCategory, Message: 'Mortgage categories added' });
            } else {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Mortgage categories not added' });
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Message: error.message });
        }
    },

    getMortgageCategory: async (req, res, next) => {
        try {

            let mortgageList = await financeService.getMortgageList();

            if (mortgageList.length) {
                return res.status(200).json({ IsSuccess: true, Count: mortgageList.length, Data: mortgageList, Message: 'Mortgage categories found' });
            } else {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Mortgage categories not found' });
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Message: error.message });
        }
    },

}