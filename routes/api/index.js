const express = require('express');
const userRoute = require('./users');
const dealerRoute = require('./dealer');
const carRoute = require('./car');
const financeRoute = require('./finance');

const router = express.Router();

router.use('/user', userRoute);
router.use('/dealer', dealerRoute);
router.use('/car', carRoute);
router.use('/finance', financeRoute);

module.exports = router;