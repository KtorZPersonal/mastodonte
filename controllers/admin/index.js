var Match = require('../../models/Match');
var myPassport = require('../../middlewares/passport');
var handlerHelper = require('../../helpers/handler');
var texts = require('../../helpers/texts');

module.exports = {
  home: function(req, res, next) {
    /* Display all active events */
    Match.findAllActive(function(err, matches){
      var destinations = {
        failure: {path: '/admin/login'},
        success: {style: 'render', path: 'admin/home'}
      };
      handlerHelper.responseHandler(err, req, res, next, destinations, {matches: matches});
    });
  },

  /* Logout from the administration section */
  logout: function(req, res) {
    req.logout();
    res.redirect('/admin/login');
  },

  /* Login to the administration section */
  login: function(req, res) {
    res.render('admin/login', handlerHelper.locals(req));
  },

  /* Handle a login request */
  connect: function(req, res, next) {
    myPassport.authenticate('local', { badRequestMessage: texts.FR.ERRORS.AUTHENTICATION },
      function(err, user, info){
        if(err) return next(err.to('/admin/login'));

        /* Connect the user and redirect him to the homepage */
        req.login(user, function(){
          res.redirect('/admin');
        });
      }
    )(req, res);
  },

  match: require('./match')
};