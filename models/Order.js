const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const Schema = mongoose.Schema;

const orderSchema = new Schema({
  user: {type: Schema.Types.ObjectId, ref: 'User'},
  cart: {type: Object, required: true},
  // address: {type: String, required: true},
  // item_name: {type: String, required: true}
});

module.exports = mongoose.model('Order', orderSchema);
