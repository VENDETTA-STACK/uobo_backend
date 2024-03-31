const mongoose = require('mongoose');

const EMIOptionsSchema = mongoose.Schema({
    bankName: {
        type: String
    },
    options: [{
        monthDuration: {
            type: Number
        },
        amountFragment: {
            type: Number
        },
        amountDue: {
            type: String
        },
        totalAmount: {
            type: Number
        },
        interestRate: {
            type: Number
        },
    }]
},
{
    timestamps: true
});

module.exports = mongoose.model('EMIOptions', EMIOptionsSchema);