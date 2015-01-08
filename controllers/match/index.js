var router = require('express').Router();
var validationsHelper = require('../../helpers/validations');
var Match = require('../../models/Match');
var User = require('../../models/User');
var th = require('../../helpers/textHandler');
var zombie = require('../../middlewares/zombie')

/* Display all active matches and coming soon */
router.get('/home', function(req, res){
  Match.findAllActive(function(err, matches){
    var now = Date.now(); var data = {}; 
    data.started = matches.filter(function(a){ return a.beginning.getTime() <= now });
    data.coming = matches.filter(function(a){ return a.beginning.getTime() > now});

    var messages = { alert: err && err.message };
    var destinations = {
      failure: {style: 'render', path: 'frontend/home'},
      success: {style: 'render', path: 'frontend/home'}
    };

    validationsHelper.responseHandler(err, req, res, messages, destinations, data);
  });
});

/* Display a match to players */
router.get('/:id/show', function(req, res){
  Match.find(req.params.id, function(err, match){
    var messages = { alert: err && err.message };

    var destinations = {
      failure: {style: 'redirect', path: '/match/home'},
      success: {style: 'render', path: 'frontend/match/show'}
    };

    validationsHelper.responseHandler(err, req, res, messages, destinations, match);
  });
});

/* Register a new user */
router.post('/:id/register', checkIfAlreadyRegistered, zombie.connect, zombie.information, function(req, res){
  /* At this point, req.information contains data about the player. Let's create a new entry in the db */

  /* We will ask the user to insert a specific key in his signature, so it will be possible to validate him */
  var key = User.genValidationKey();
  User.create({
    username: req.body.username,
    id2f: req.information.id,
    type: User.TYPES.PLAYER,
    avatar: req.information.avatar,
    verificationKey: key
  }, function(err, user){
    console.log(err);
    res.send(user);
  });
});

/* Ensure that a user isn't already registered */
function checkIfAlreadyRegistered(req, res, next) {
  User.findByUsername(req.body.username, function(err, user) {
    /* The user doesn't exist, it's okay, let's continue */
    if(err && err.name == 'ModelError' && err.type == 'ENTITY_NOT_FOUND') return next();
    /* If it's another error, stop the process here and render an error page */
    if(err) {
      var messages = { alert: err.message };
      var destinations = {failure: {style: 'redirect', path: '/match/' + +req.params.id + '/home'}};
      validationsHelper.responseHandler(err, req, res, messages, destinations);
    }

    /* If the user has been found, ensure he's not already verified for this match */
    //res.send(user);
  });
}

module.exports = router;