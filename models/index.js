// Centralized export file for all models
const Booking = require('./Booking');
const Customer = require('./Customer');
const Hotel = require('./Hotel');
const Room = require('./Room');
const { Category, SubCategory } = require('./Category');
const Payment = require('./Payment');
const Metadata = require('./Metadata');

module.exports = {
    Booking,
    Customer,
    Hotel,
    Room,
    Category,
    SubCategory,
    Payment,
    Metadata
};
