var router = require('express').Router();
var validationsHelper = require('../../helpers/validations');
var myPassport = require('../../middlewares/passport');
var Match = require('../../models/Match');
var th = require('../../helpers/textHandler');

/* Add all routes about matches */
router.use('/match', myPassport.ensureAuthenticated, require('./match'));

/* Route to the admin's homepage */
router.get('/', myPassport.ensureAuthenticated, function(req, res){
  /* Here, we handle flash messages, errors & previously posted parameters */
  var locals = validationsHelper.locals(req);

  /* Display all active events */
  Match.findAllActive(function(err, matches){
    locals.matches = matches;
    res.render('admin/home', locals);
  });
});

/* Logout from the administration section */
router.get('/logout', myPassport.ensureAuthenticated, function(req, res){

});


/* Login to the adminstration section */
router.get('/login', function(req, res){
  res.render('admin/login', validationsHelper.locals(req));
});
router.post('/login', function(req, res){
  myPassport.authenticate('local', { badRequestMessage: th.FR.ERRORS.AUTHENTICATION },
    function(err, user, info){
      if(err || info) {
        /* Don't want to inform user of the real nature of the error. */
        var message = err ? 
          (err.name == 'ModelError' && err.type != 'UNKNOWN' ? th.FR.ERRORS.AUTHENTICATION : err.message)
          : info.message;
        req.flash('alert', message);
        res.redirect('/admin/login');
      } else {
        /* Authenticate the user */
        req.login(user, function(){
          res.redirect('/admin');
        })
      }
    })(req, res);
});

/* Export as a middleware to be use in the global routing handler*/
module.exports = router;