var router = require('express').Router();
var validationsHelper = require('../../helpers/validations');
var Match = require('../../models/Match');
var th = require('../../helpers/textHandler');

/* Display all active matches and coming soon */
router.get('/home', function(req, res){
  Match.findAllActive(function(err, matches){
    if(err) {
      req.flash('alert', err.message);
      matches = [];
    }    
    var locals = validationsHelper.locals(req);
    var now = Date.now();
    console.log(matches);
    locals.data.started = matches.filter(function(a){ return a.beginning.getTime() <= now });;
    locals.data.coming = matches.filter(function(a){ return a.beginning.getTime() > now});;
    console.log(locals);
    res.render('match/home', locals);
  });
});

module.exports = router;