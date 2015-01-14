var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/User');
var FrontendError = require('../models/FrontendError');
var texts = require('../helpers/texts')

/* User has to be serialized and unserialized to be 
passed though session */
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(userId, done) {
  User.findById(userId, function(err, user) {
    /* Just pass the err if one, controller will handle it */
    done(err, user);
  });
});

/* Use the local strategy */
passport.use(new LocalStrategy(function(username, password, done){
  var failureDest = '/admin/login';
  User.findByUsername(username, function(err, user){
    /* Err rewritted because user should not know the precise nature of the nature*/
    if (err) return done(new FrontendError('AUTHENTICATION', failureDest, undefined, err.internalError), false);
    user.comparePassword(password, function(err, isMatch){
      if (err) return done(new FrontendError('AUTHENTICATION', failureDest, undefined, err.internalError), false);
      if (!isMatch) return done(new FrontendError('AUTHENTICATION', failureDest), false);
      return done(null, user);
    });
  });
}));

/* Little middleware in order to ensure that the user is authenticated */
passport.ensureAuthenticated = function(req, res, next){
  var error = req.isAuthenticated() ? null : new FrontendError('NOT_AUTHENTICATED', '/admin/login');
  next(error);
}

module.exports = passport;