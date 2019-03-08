const express = require('express');
const router = express.Router();
const houseController = require('../controllers/houseController');
const { catchErrors } = require('../handlers/errorHandlers');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');


router.get('/', catchErrors(houseController.homepage));
router.get('/houses', catchErrors(houseController.getHouses));
router.get('/add', authController.isLoggedIn, houseController.addHouse);
router.post('/add',
	authController.isLoggedIn,
	houseController.upload, 
	catchErrors(houseController.resize), 
	catchErrors(houseController.createHouse)
	);
router.post('/add/:id', 
	houseController.upload, 
	catchErrors(houseController.resize), 
	catchErrors(houseController.updateHouse)
	);
router.get('/houses/:id/edit', authController.isLoggedIn, catchErrors(houseController.editHouse));
router.get('/houses/:slug', catchErrors(houseController.getHouseBySlug));

// router.get('/login', userController.loginForm);
// router.get('/register', userController.registerForm);

router.post('/login', authController.login, function (req, res, next) {
	if (req.session.oldUrl) {
		let oldUrl = req.session.oldUrl;
		req.session.oldUrl = null;
		res.redirect(oldUrl);
		req.flash("success", "you are now logged in");
	} else {
		res.redirect('/account');
	}
});

router.post('/register', 
	userController.validateRegistration,
	userController.register,
	authController.login
	);

router.get('/logout', authController.logout);

router.get('/account', authController.isLoggedIn, catchErrors(userController.account));
router.post('/account', authController.isLoggedIn, catchErrors(userController.updateAccount));

router.get('/cart', houseController.getCart);
router.post('/cart', catchErrors(houseController.postCart));
router.get('/checkout', authController.isLoggedIn, houseController.getCheckout);
router.post('/checkout', authController.isLoggedIn, houseController.postCheckout);

// router.post('/cart-delete-item', houseController.postCartDeleteProduct);
// router.post('/create-order', houseController.postOrder);
// router.get('/orders', houseController.getOrders);


module.exports = router;
