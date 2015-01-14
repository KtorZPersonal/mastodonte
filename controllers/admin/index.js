var Match = require('../../models/Match');
var myPassport = require('../../middlewares/passport');
var handlerHelper = require('../../helpers/handler');
var texts = require('../../helpers/texts');

module.exports = {
  home: function(req, res) {
    /* Here, we handle flash messages, errors & previously posted parameters */
    var locals = handlerHelper.locals(req);

    /* Display all active events */
    Match.findAllActive(function(err, matches){
      locals.data.matches = matches;
      res.render('admin/home', locals);
    });
  },

  /* Logout from the administration section */
  logout: function(req, res) {
    req.logout();
    res.redirect('/admin');
  },

  /* Login to the administration section */
  login: function(req, res) {
    res.render('admin/login', handlerHelper.locals(req));
  },

  /* Handle a login request */
  connect: function(req, res, next) {
    myPassport.authenticate('local', { badRequestMessage: texts.FR.ERRORS.AUTHENTICATION },
      function(err, user, info){
        if(err) return next(err);

        /* Connect the user and redirect him to the homepage */
        req.login(user, function(){
          res.redirect('/admin');
        });
      }
    )(req, res);
  },

  match: require('./match')
};