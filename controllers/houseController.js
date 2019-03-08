const mongoose = require('mongoose');
const House = mongoose.model('House');
const Order = mongoose.model('Order');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');
var Cart = require('../models/Cart');

const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    const isPhoto = file.mimetype.startsWith('image/');
    if(isPhoto) {
      next(null, true);
    } else {
      next({ message: 'That filetype isn\'t allowed!' }, false);
    }
  }
};

exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
  // check if there is no new file to resize
  if (!req.file) {
    next(); // skip to the next middleware
    return;
  }
  const extension = req.file.mimetype.split('/')[1];
  req.body.photo = `${uuid.v4()}.${extension}`;
  // now we resize
  const photo = await jimp.read(req.file.buffer);
  await photo.resize(800, jimp.AUTO);
  await photo.write(`./public/uploads/${req.body.photo}`);
  // once we have written the photo to our filesystem, keep going!
  next();
};


exports.homepage = async (req, res, next) => {
	const houses = await House.find();
	res.render('index', {title: 'HomePage', houses});
};

exports.addHouse = (req, res) => {
	res.render('addProperty', {title: 'Add Property', localClassVar: 'page-property', localIdVar: 'page-top'});
};

exports.createHouse = async (req, res) => {
	req.body.author = req.user._id
	const house = await (new House(req.body)).save();
	req.flash('success', `Successfully listed ${req.body.item_name}`);
	res.redirect('/');
};

exports.getHouses = async (req, res) => {
	const houses = await House.find();
	res.render('propertyListType', {title: 'Properties Listed', localClassVar: 'page-search', localIdVar: 'page-top', houses});
};

const confirmOwner = (house, user) => {
	if (!house.author.equals(user._id)) {
		throw Error('You must own a house to make changes to it');
	}
}

exports.editHouse = async (req, res) => {
	const house = await House.findOne({_id: req.params.id});
	confirmOwner(house, req.user)
	res.render('editProperty', {title: `Edit ${house.item_name}`, house, localClassVar: 'page-property', localIdVar: 'page-top'});
};

exports.updateHouse = async (req, res) => {
	const house = await House.findOneAndUpdate({_id: req.params.id}, req.body, {
		new: true,
		runValidators: true
	}).exec();
	req.flash('success', `Successfully updated <strong>${house.item_name}</strong>`);
	res.redirect(`/houses/${house._id}/edit`);
};

exports.getHouseBySlug = async (req, res, next) => {
	const house = await House.findOne({slug: req.params.slug}).populate('author');
	if (!house) {
		next();
		return;
	}
	res.render('propertyPage', {title: house.item_name, localClassVar:'page-property', localIdVar:'page-top', house});
};

exports.getCart = (req, res, next) => {
    if (!req.session.cart) {
      return res.render('cart', {
        title: "My Cart",
        products: null
      });
    }
	  console.log(req.session);

	  let cart = new Cart(req.session.cart);
	  console.log(req.session);

	  let houses = cart.generateArray();
	  let totalPrice = cart.totalPrice;
	  
	  res.render('cart', {
      title: "My Cart",
	    houses,
	    totalPrice
	  });
};

exports.postCart = async (req, res, next) => {
  console.log(req.session);
  let houseId = req.body.houseId;
  let cart = new Cart(req.session.cart ? req.session.cart : {});

  let house = await House.findById(houseId);
    cart.add(house, house._id);
    req.session.cart = cart;
    console.log("Using id:" + req.session.id);
    // console.log("Using _id:" + req.session._id); Doesn't work
    res.redirect('/houses');
};

exports.getCheckout = (req, res, next) => {
  if (!req.session.cart) {
    return res.redirect('/cart');
  }
  let cart = new Cart(req.session.cart);
  let errMsg = req.flash('error')[0];
  res.render('/checkout', {
    total: cart.totalPrice,
    errMsg: errMsg,
    noError: !errMsg
  });
};

exports.postCheckout = (req, res, next) => {
  if (!req.session.cart) {
    return res.redirect('/cart');
  }
  let cart = new Cart(req.session.cart);

  let order = new Order({
      user: req.user,
      cart: cart,
      // item_name: req.body.name
    });
    order.save(function(err, result) {
      req.flash('success', 'Your Order has been completed');
      req.session.cart = null;
      res.redirect('/');
    });
}

// callback hell -> es6 promises(reminds of jQuery, bluebird etc) -> async/await(using try catch) ->
// async/await(using composition error functions) -> es6 promisify
