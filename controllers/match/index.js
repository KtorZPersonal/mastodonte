var router = require('express').Router();
var validationsHelper = require('../../helpers/validations');
var Match = require('../../models/Match');
var User = require('../../models/User');
var th = require('../../helpers/textHandler');
var z = require('../../middlewares/zombie')

/* Display all active matches and coming soon */
router.get('/home', function(req, res){
  Match.findAllActive(function(err, matches){
    var data = {}; 
    data.started = matches.filter(function(a){ return a.isStarted(); });
    data.coming = matches.filter(function(a){ return !a.isStarted(); });

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

/* Prepare registration for a user. Two cases. The user already exists in the database as
  he has participated to a previous event. Or, he doesn't, and one has to create a new entry
  for this user. Both case will be exactly similar to the user. The app will send him a secret
  key to verify his identity. 
 */
router.post('/:id/register', ensureEventReg, ensureUser, z.connect, z.information, function(req, res){
  /* At this point, req.information contains data about the player. Let's create a new entry in the db */
  /* We will ask the user to insert a specific key in his signature, so it will be possible to validate him */
  var matchId = req.params.id;
  var key = User.genValidationKey();
  var messages = {};
  var destinations = {
    failure: {style: 'redirect', path: '/match/' + matchId + '/show'},
    success: {style: 'render', path: 'frontend/match/register'}
  };
  var data = {
    key: key, 
    id: matchId,
  };

  if(req.user) {
    /* The user exist, but is not registered on this match */
    req.user.verificationKeys[matchId] = key;
    User.update(req.user.id, req.user, function(err){
      /* Error on the update... Just transmit the message */
      messages.alert = err && err.message;

      /* Everything is good, user has been updated. Send the data */
      data.user = req.user;
      validationsHelper.responseHandler(err, req, res, messages, destinations, data);
    });
  } else {
    /* The user doesn't exist yet */
    var verificationKeys = {};
    verificationKeys[matchId] = key;

    User.create({
      username: req.body.username,
      id2f: req.information.id,
      type: User.TYPES.PLAYER,
      avatar: req.information.avatar,
      verificationKeys: verificationKeys
    }, function(err, user){
      /* If error during the creation => Probably because some information are missing */
      messages.alert = err && err.message;

      /* Transmit the newly created user to the view*/
      data.user = user;
      validationsHelper.responseHandler(err, req, res, messages, destinations, data);
    });
  }
});

/* Validate a user subscription to a match */
router.post('/:id/confirm', ensureEventReg, retrieveUser, z.connect, z.checkMails, function(req, res){
  /* After all middlewares, this means that, the user send with the post's params 
  exists, is registering for a match of id :id, and, has sent an email to the verification
  account with the good key ! Let's validate him */
  var matchId = req.params.id;
  var destination = '/match/' + matchId + '/show';

  /* Key not found, bad user */
  if(!req.keyFound) {
    req.flash('alert', th.FR.SERVICES.IDENTITY_VERIFICATION.FAILURE);
    return res.redirect(destination);
  }

  /* Key found, update the user */
  req.user.verifiedEvents.push(matchId);
  delete req.user.verificationKeys[matchId];
  User.update(req.user.id, req.user, function(err) {
    var messages = {
      alert: err && err.message,
      info: th.FR.SERVICES.REGISTRATION.SUCCESS
    };
    var destinations = {
      failure: {style: 'redirect', path: destination},
      success: {style: 'redirect', path: destination}
    };
    if(err) return validationsHelper.responseHandler(err, req, res, messages, destinations);
    
    Match.register(matchId, req.user.id, function(err){
      messages.alert = err && err.messages;
      validationsHelper.responseHandler(err, req, res, messages, destinations)  
    });
  });

});

/* Validate a fight in a specific event */
router.post('/:id/validate', z.parseFight, retrieveUsers, function(req, res){
  var matchId = req.params.id;
  var destination = '/match/' + matchId + "/show";

  /* Check if the fight is valid */
  Match.validateFight(matchId, req.fight, function(err, match){
    var messages = {
      alert: err && err.message,
      info: th.FR.SERVICES.VALIDATE.SUCCESS
    };

    var destinations = {
      failure: {type: 'redirect', path: destination},
      success: {type: 'redirect', path: destination}
    };
    if(err) return validationsHelper.responseHandler(err, req, res, messages, destinations);

    /* Create the fight in the db */
    Fight.create(req.fight, function(err, fight){
      messages.alert = err && err.message;
      if(err) return validationsHelper.responseHandler(err, req, res, messages, destinations);
      /* Add the fight to others */
      match.fights.push(fight.id);
      Match.update(match.id, match, function(err, fight){
        messages.alert = err && err.messages;
        validationsHelper.responseHandler(err, req, res, messages, destinations);
      });
    });
  });
})

/* Retieve data on participants */
function retrieveUsers(req, res, next) {
  var matchId = req.params.id;
  var failureDestination = '/match/' + matchId + '/show';
  /* If there is no fight, throw back an error */
  if(!req.fight) {
    req.flash('alert', th.FR.ERRORS.INVALID_PARAM);
    return res.redirect(failureDestination);
  }

  var finished = 0; var errors = []; 
  var handler = function(err) {
    finished++;
    if(err) errors.push(err);

    if(finished == 2) {
      /* On errors, return a global error */
      if(errors.length > 0) {
        req.flash('alert', th.FR.SERVICES.VALIDATE.FAILURE);
        return res.redirect(failureDestination);
      }

      next();
    }
  }

  /* Retrieve each participants */
  User.findByUsername(req.fight.players.left, function(err, user){
    req.fight.players.left = user;
    handler(err);
  });
  User.findByUsername(req.fight.players.right, function(err, user){
    req.fight.players.right = user;
    handler(err);
  });
}

/* Ensure that a user is trying to register to a valid event */
function ensureEventReg(req, res, next) {
  var failureDestination = "/match/home";
  Match.find(req.params.id, function(err, match){
    /* An error with the database, most probable => the match doesn't exist */
    if(err) {
      req.flash('alert', err.message);
      return res.redirect(failureDestination);
    } 

    /* No error, but, is the match started ? */
    if(match.isStarted() || match.isEnded()) {
      req.flash('alert', th.FR.ERRORS.INVALID_PARAM);
      return res.redirect(failureDestination);
    }

    /* The match exist, registration are open, then let's go :) */
    next();
  });
}

/* Ensure that a user isn't already registered */
function ensureUser(req, res, next) {
  User.findByUsername(req.body.username, function(err, user) {
    var matchId = +req.params.id;

    /* The user doesn't exist, it's okay, let's continue */
    if(err && err.name == 'ModelError' && err.type == 'ENTITY_NOT_FOUND') return next();

    /* If it's another error, stop the process here and render an error page */
    if(err) { req.flash('alert', err.message); } 
    else {
      /* If the user has been found, ensure he's not already verified for this match */
      req.user = user;

      /* Not already registered on this match */
      if(!user.isRegisteredFor(matchId)) return next();

      /* Else, send him an alert message */
      req.flash('alert', th.FR.SERVICES.REGISTRATION.FAILURE);
    }
    
    /* Redirect without calling next() will stop the whole process */
    res.redirect('/match/' + matchId + '/show');
  });
}

/* Get the user's key corresponding to a request. If the user doesn't exist, or
  doesn't have a registration key, the userVerificationKey attr will not be set. */
function retrieveUser(req, res, next) {
  User.findByUsername(req.body.username, function(err, user) {
    req.user = user && user.verificationKeys[req.params.id] && user;
    next();
  });
}

module.exports = router;