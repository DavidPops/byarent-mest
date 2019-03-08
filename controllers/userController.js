const mongoose = require('mongoose');
const User = mongoose.model('User');
const House = mongoose.model('House');
const Order = mongoose.model('Order');
const promisify = require('es6-promisify');

// exports.loginForm = (req, res) => {
// 	res.render('login', { title: 'Log In'});
// }

// export.registerForm = (req, res) => {
	// res.render('register', { title: 'Register'});
// }

exports.validateRegistration = (req, res, next) => {
	req.sanitizeBody('name');
	req.checkBody('fName', 'You must supply a name').notEmpty();
	req.checkBody('lName', 'You must supply a name').notEmpty();
	req.checkBody('email', 'Please provide a valid email address').isEmail();
	req.sanitizeBody('email').normalizeEmail({
		remove_dots: false,
		remove_extension: false,
		gmail_remove_subaddress: false
	});
	req.checkBody('password', 'password cannot be blank').notEmpty();
	req.checkBody('confirmpassword', 'This field cannot be blank').notEmpty();
	req.checkBody('confirmpassword', 'passwords do not match').equals(req.body.password);

	const errors = req.validationErrors();
	if (errors) {
		req.flash('error', errors.map(err => err.msg)); //also highlight which field also had an error.
		res.redirect('/houses');
		// res.render('register', {title: 'Register', body: req.body, flashes: req.flash() });
		return;
	}
	next();
};

exports.register = async (req, res, next) => {
  const user = new User({ email: req.body.email, name: req.body.fName + ' ' + req.body.lName });
  const register = promisify(User.register, User);
  await register(user, req.body.password);
  next(); // pass to authController.login
};

exports.account = async (req, res) => {
	const housePromise = House.find({author: req.user._id});
	const orderPromise = Order.find({user: req.user});

	// const tagsPromise = Store.getTagsList();
  	// const storesPromise = Store.find({ tags: tagQuery });
  	const [houses, orders] = await Promise.all([housePromise, orderPromise]);
  	orders.forEach(function(order) {
      cart = new Cart(order.cart);
      order.items = cart.generateArray();
    });
	// console.log(houses);
  	res.render('userProfile', { title: 'Edit Your Account', localClassVar: 'page user-profile', localIdVar: 'page-top', houses, orders });
};

exports.updateAccount = async (req, res) => {
  const updates = {
    name: req.body.fName + ' ' + req.body.lName,
    email: req.body.email
  };

  const user = await User.findOneAndUpdate(
    { _id: req.user._id },
    { $set: updates },
    { new: true, runValidators: true, context: 'query' }
  );
  req.flash('success', 'Updated the profile!');
  res.redirect('back');
};
