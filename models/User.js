const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const md5 = require('md5');
const validator = require('validator');
const mongodbErrorHandler = require('mongoose-mongodb-errors');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
	email: {
		type: String,
		unique: true,
		lowercase: true,
		trim: true,
		validate: [validator.isEmail, 'Invalid Email Address'],
		required: 'Please supply an email address'
	},
	name: {
		type: String,
		required: 'Please supply a name',
		trim: true
	}
});

// userSchema.virtual('gravatar').get(function() {
//   const hash = md5(this.email);
//   return `https://gravatar.com/avatar/${hash}?s=200`;
// });

userSchema.plugin(passportLocalMongoose, {usernameField: 'email'});
userSchema.plugin(mongodbErrorHandler);

/*userSchema.methods.addToCart = function(house) {
  const cartProductIndex = this.cart.items.findIndex(cp => {
    return cp.houseId.toString() === house._id.toString();
  });
  let newQuantity = 1;
  const updatedCartItems = [...this.cart.items];

  if (cartProductIndex >= 0) {
    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartItems[cartProductIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({
      houseId: product._id,
      quantity: newQuantity
    });
  }
  const updatedCart = {
    items: updatedCartItems
  };
  this.cart = updatedCart;
  return this.save();
};*/

/*userSchema.methods.removeFromCart = function(houseId) {
  const updatedCartItems = this.cart.items.filter(item => {
    return item.houseId.toString() !== houseId.toString();
  });
  this.cart.items = updatedCartItems;
  return this.save();
};*/

/*userSchema.methods.clearCart = function() {
  this.cart = { items: [] };
  return this.save();
};*/

module.exports = mongoose.model('User', userSchema);