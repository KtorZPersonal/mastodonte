var router = require('express').Router();
var validationsHelper = require('../../helpers/validations');
var Match = require('../../models/Match');
var User = require('../../models/User');
var th = require('../../helpers/textHandler');
var cu = require('../../middlewares/controllerUtils');
var z = require('../../middlewares/zombie');

/* Prepare registration for a user. Two cases. The user already exists in the database as
  he has participated to a previous event. Or, he doesn't, and one has to create a new entry
  for this user. Both case will be exactly similar to the user. The app will send him a secret
  key to verify his identity. 
 */
router.post('/register', z.connect, z.information, function(req, res){
  var matchId = req.params.id; 
  /* Prepare return data for the validation helper */
  var messages = { alert: th.FR.SERVICES.REGISTRATION.FAILURE };
  var destinations = {
    failure: {style: 'redirect', path: '/match/' + matchId + '/show'},
    success: {style: 'render', path: 'frontend/match/register'}
  };

  /* At this point, req.cData.information should contain data about the player */
  if(!req.cData.information) {
    req.flash('alert', messages.alert);
    return res.redirect(destinations.failure.path);
  }

  /* We will ask the user to send a specific key by mail to validate him */
  req.session.params = {};
  req.session.params.user = User.createShape(req.body.username, req.cData.information.id, 
    req.cData.information.avatar);
  req.session.params.verificationKey = User.genValidationKey();
  req.session.params.id = matchId;
  res.render(destinations.success, validationsHelper.locals(req));
});

/* Validate a user subscription to a match */
router.post('/confirm', z.connect, z.checkMails, function(req, res){
  /* After all middlewares, this means that, the user send with the post's params 
  exists, is registering for a match of id :id, and, has sent an email to the verification
  account with the good key ! Let's validate him */
  var matchId = req.params.id;
  var messages = {
    alert: th.FR.SERVICES.IDENTITY_VERIFICATION.FAILURE, //TODO pas logique
    info: th.FR.SERVICES.REGISTRATION.SUCCESS
  };
  var destinations = {
    failure: {style: 'redirect', path: '/match/' + matchId + '/show'},
    success: {style: 'redirect', path: '/match/' + matchId + '/show'}
  };
  /* Key not found or bad user */
  if(!req.cData.keyFound || !req.cData.user || !req.cData.user.id) {
    req.flash('alert', messages.alert);
    return res.redirect(destinations.failure.path);
  }

  /* Key found, update the user */
  req.cData.user.verifiedEvents.push(matchId);
  delete req.user.verificationKeys[matchId];
  User.update(req.user.id, req.user, function(err) {
    if(err) {
      req.flash('alert', err.message);
      return res.redirect(destinations.failure.path);
    }
    
    Match.register(matchId, req.user.id, function(err){
      messages.alert = err && err.messages;
      validationsHelper.responseHandler(err, req, res, messages, destinations)  
    });
  });
});

/* Get the user's key corresponding to a request. If the user doesn't exist, or
  doesn't have a registration key, the userVerificationKey attr will not be set. */
function retrieveUser(req, res, next) {
  User.findByUsername(req.body.username, function(err, user) {
    /* Dont build the user if there is an other error */
    if(err && err.type != 'ENTITY_NOT_FOUND') return next();

    if(user) {
      /* User has been found, great, nothing to do but updating the avatar */
      user.avatar = req.cData.information.avatar;
      req.cData.user = user;
      next();
    } else { 
      req.cData.user = User.createShape(req.body.username, req.cData.information.id,
        req.cData.information.avatar);
      next();
    }
  });
};


// All above needs to be move into models
// /* Ensure that a user isn't already registered */
// function ensureUser(req, res, next) {
//   User.findByUsername(req.body.username, function(err, user) {
//     var matchId = +req.params.id;

//     /* The user doesn't exist, it's okay, let's continue */
//     if(err && err.name == 'ModelError' && err.type == 'ENTITY_NOT_FOUND') return next();

//     /* If it's another error, stop the process here and render an error page */
//     if(err) { req.flash('alert', err.message); } 
//     else {
//       /* If the user has been found, ensure he's not already verified for this match */
//       req.user = user;

//       /* Not already registered on this match */
//       if(!user.isRegisteredFor(matchId)) return next();

//       /* Else, send him an alert message */
//       req.flash('alert', th.FR.SERVICES.REGISTRATION.FAILURE);
//     }
    
//     /* Redirect without calling next() will stop the whole process */
//     res.redirect('/match/' + matchId + '/show');
//   });
// }

// /* Ensure that a user is trying to register to a valid event */
// function ensureEventReg(req, res, next) {
//   var failureDestination = "/match/home";
//   Match.find(req.params.id, function(err, match){
//     /* An error with the database, most probable => the match doesn't exist */
//     if(err) {
//       req.flash('alert', err.message);
//       return res.redirect(failureDestination);
//     } 

//     /* No error, but, is the match started ? */
//     if(match.isStarted() || match.isEnded()) {
//       req.flash('alert', th.FR.ERRORS.INVALID_PARAM);
//       return res.redirect(failureDestination);
//     }

//     /* The match exist, registration are open, then let's go :) */
//     next();
//   });
// }
module.exports = router;