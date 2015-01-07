var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/User');
var th = require('../helpers/textHandler')

/* User has to be serialized and unserialized to be 
passed though session */
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(userId, done) {
  console.log(userId);
  User.findById(userId, function(err, user) {
    done(err, user);
  });
});

/* Use the local strategy */
passport.use(new LocalStrategy(function(username, password, done){
  User.findByUsername(username, function(err, user){
    if (err) return done(err, false);
    user.comparePassword(password, function(err, isMatch){
      if (err) return done(err, false);
      if (!isMatch) return done(null, false, { message: th.FR.ERRORS.AUTHENTICATION })
      return done(null, user);
    });
  });
}));

passport.ensureAuthenticated = function(req, res, next){
  if (req.isAuthenticated()) return next();
  res.redirect('/admin/login');
}

module.exports = passport;