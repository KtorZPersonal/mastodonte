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
      locals.matches = matches;
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
  connect: function(req, res) {
    myPassport.authenticate('local', { badRequestMessage: texts.FR.ERRORS.AUTHENTICATION },
      function(err, user, info){
        if(err || info) {
          /* Don't want to inform user of the real nature of the error. */
          var message = err ? 
            (err.name == 'ModelError' && err.type != 'UNKNOWN' ? texts.FR.ERRORS.AUTHENTICATION : err.message)
            : info.message;
          req.flash('alert', message);
          res.redirect('/admin/login');
        } else {
          /* Authenticate the user */
          req.login(user, function(){
            res.redirect('/admin');
          })
        }
      }
    )(req, res);
  },

  match: require('./match')
};