const passport = require('passport');

exports.login = passport.authenticate('local', {
  failureRedirect: '/houses',
  failureFlash: 'Failed Login!',
  // successRedirect: '/',
  // successFlash: 'You are now logged in!'
});

exports.logout = (req, res) => {
  req.logout();
  req.flash('success', 'You are now logged out! 👋');
  req.session.destroy();
  res.redirect('/');
};

exports.isLoggedIn = (req, res, next) => {
  // first check if the user is authenticated
  if (req.isAuthenticated()) {
    next(); // carry on! They are logged in!
    return;
  }
  req.flash('error', 'Oops you must be logged in to do that!');
  req.session.oldUrl = req.url;
  res.redirect('/login');
};