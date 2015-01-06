/* Administration routing */
var router = require('express').Router();
var validationsHelper = require('../../helpers/validations');
var Match = require('../../models/Match');

/* Add all routes about matches */
router.use('/match', require('./match'));

/* Route to the admin's homepage */
router.get('/', function(req, res){
  /* Here, we handle flash messages, errors & previously posted parameters */
  var locals = validationsHelper.locals(req, ['beginning', 'ending']);

  /* Display all active events */
  Match.findAllActive(function(err, matches){
    locals.matches = matches;
    res.render('admin/home', locals);
  });
});

/* Logout from the administration section */
router.get('/logout', function(req, res){

});

/* Export as a middleware to be use in the global routing handler*/
module.exports = router;