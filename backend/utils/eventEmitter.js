const EventEmitter = require('events');

class OrderEventEmitter extends EventEmitter {}
const orderEmitter = new OrderEventEmitter();

module.exports = orderEmitter;
