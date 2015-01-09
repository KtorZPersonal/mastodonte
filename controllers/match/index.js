var router = require('express').Router();
var validationsHelper = require('../../helpers/validations');
var Match = require('../../models/Match');
var User = require('../../models/User');
var th = require('../../helpers/textHandler');
var z = require('../../middlewares/zombie')

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
router.post('/:id/register', checkIfReg, z.connect, z.information, function(req, res){
  /* At this point, req.information contains data about the player. Let's create a new entry in the db */
  /* We will ask the user to insert a specific key in his signature, so it will be possible to validate him */
  var matchId = req.params.id;
  var failureDestination = '/match/' + matchId + '/show';
  var key = User.genValidationKey();

  if(req.user) {
    /* The user exist, but is not registered on this match */
    req.user.verificationKeys[matchId] = key;
    User.update(req.user, function(err){
      if(err) {
        req.flash('alert', err.message);
        return res.redirect(failureDestination);
      }
      var locals = validationsHelper.locals(req);
      locals.data = {
        key: key, 
        id: matchId, 
        user: req.user
      };
      res.render('frontend/match/register', locals);
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
      var locals = validationsHelper.locals(req);
      locals.data = {
        key: key, 
        id: matchId, 
        user: user
      };
      res.render('frontend/match/register', locals);
    });
  }
});

/* Validate a user subscription to a match */
router.post('/:id/confirm', retrieveUser, z.connect, z.checkMails, function(req, res){
  /* After all middlewares, this means that, the user send with the post's params 
  exists, is registering for a match of id :id, and, has sent an email to the verification
  account with the good key ! Let's validate him */
  var matchId = req.params.id;
  var destination = '/match/' + matchId + '/show';

  /* Key not found, bad user */
  if(!req.keyFound) {
    req.flash('alert', th.FR.ERRORS.VALIDATION_KEY);
    return res.redirect(destination);
  }

  /* Key found, update the user */
  req.user.verifiedMatches.push(matchId);
  delete req.user.verificationKeys[matchId];
  User.update(req.user, function(err) {
    if(err) req.flash('alert', err.message);
    res.redirect(destination);
  });

});

/* Ensure that a user isn't already registered */
function checkIfReg(req, res, next) {
  User.findByUsername(req.body.username, function(err, user) {

    /* The user doesn't exist, it's okay, let's continue */
    if(err && err.name == 'ModelError' && err.type == 'ENTITY_NOT_FOUND') return next();

    /* If it's another error, stop the process here and render an error page */
    if(err) { req.flash('alert', err.message); } 
    else {
      /* If the user has been found, ensure he's not already verified for this match */
      req.user = user;
      isAlreadyRegistered = false;
      user.verifiedMatches.forEach(function(match){
        isAlreadyRegistered = isAlreadyRegistered || match._id == +req.params.id
      });

      /* Not already registered on this match */
      if(!isAlreadyRegistered) return next();

      /* Else, send him an alert message */
      req.flash('alert', th.FR.ERRORS.ALREADY_REGISTERED);
    }
    
    res.redirect('/match/' + +req.params.id + '/show');
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

    // User.create({
    //   username: 'KnightWalker',
    //   id2f: 908,
    //   type: User.TYPES.PLAYER,
    //   avatar: '/upload/1408667567.png',
    //   verificationKey: null,
    //   verifiedMatches: [8]
    // }, function(err, knight){
    //   console.log(err);
    //   res.send(knight);
    // });