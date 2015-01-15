var Match = require('../../models/Match');
var User = require('../../models/User');
var Fight = require('../../models/Fight');
var FrontendError = require('../../models/FrontendError');
var texts = require('../../helpers/texts');
var handlerHelper = require('../../helpers/handler');

module.exports = {
  /* Display all active matches and coming soon */
  home: function(req, res, next){
    Match.findAllActive(function(err, matches){
      var destinations = {
        failure: {path: '/error'},
        success: {style: 'render', path: 'public/home'}
      };

      var data = {}; 
      matches = matches || [];
      data.started = matches.filter(function(a){ return a.isStarted(); });
      data.coming = matches.filter(function(a){ return !a.isStarted(); });
      handlerHelper.responseHandler(err, req, res, next, destinations, data);
    });
  },

  /* Display a match to players */
  show: function(req, res, next){
    Match.find(req.params.id, function(err, match){
      var destinations = {
        failure: {path: '/match/home'},
        success: {style: 'render', path: 'public/match/show'}
      };

      handlerHelper.responseHandler(err, req, res, next, destinations, match);
    });
  },

  /* Prepare registration for a user. Two cases. The user already exists in the database as
    he has participated to a previous event. Or, he doesn't, and one has to create a new entry
    for this user. Both case will be exactly similar to the user. The app will send him a secret
    key to verify his identity. 
   */
  register: function(req, res, next){
    var matchId = req.params.id; 
    /* Prepare return destinations for the validation helper */
    var destinations = {
      failure: {path: '/match/' + matchId + '/show'},
      success: {path: 'public/match/register'}
    };

    /* At this point, req.cData.information should contain data about the player */
    if(!req.cData.information.id) return next(new FrontendError('ENTITY_NOT_FOUND', {entity: texts.FR.MODELS.USER.NAME}, 
      destinations.failure.path));

    /* We will ask the user to send a specific key by mail to validate him */
    req.session.userShape = User.createShape(req.body.username, req.cData.information.id, req.cData.information.avatar);
    req.session.verificationKey = User.genValidationKey();

    var locals = handlerHelper.locals(req);
    locals.data.user = req.session.userShape;
    locals.data.verificationKey = req.session.verificationKey;

    res.render(destinations.success.path, locals);
  },

  /* Validate a user subscription to a match */
  confirm: function(req, res, next){
    var matchId = req.params.id;
    var message = texts.FR.SERVICES.REGISTRATION.SUCCESS;
    var destinations = {
      failure: {path: '/match/' + matchId + '/show'},
      success: {style: 'redirect', path: '/match/' + matchId + '/show'}
    };

    /* Key not found */
    if(!req.cData.keyFound) return next(new FrontendError('IDENTITY_VERIFICATION', destinations.failure.path));

    /* Key found, update the user */
    User.register(req.session.userShape, matchId, function(err, user) {
      if(err) return next(err.to(destinations.failure.path));
      console.log(user.id);
      Match.register(matchId, user.id, function(err){
        handlerHelper.responseHandler(err, req, res, next, destinations, message, destinations);
      });
    });
  },

  /* Validate a fight in a specific event */
  validate: function(req, res, next){
    var matchId = req.params.id;
    var message = texts.FR.SERVICES.VALIDATE.SUCCESS;
    var destinations = {
      failure: {path: '/match/' + matchId + "/show"},
      success: {type: 'redirect', path: '/match/' + matchId + "/show"}
    };

    /* Return an error if there is a problem */
    if(!req.cData.fight) return next(new FrontendError('INVALID_PARAM', destinations.failure.path));

    /* Check if the fight is valid */
    Match.validateFight(matchId, req.cData.fight, function(err, match){
      if(err) return next(err.to(destinations.failure.path));

      /* Create the fight in the db */
      Fight.create(req.cData.fight, function(err, fight){
        if(err) return next(err.to(destinations.failure.path));

        /* Add the fight to others */
        match.fights.push(fight.id);
        Match.update(match.id, match, function(err, fight){
          handlerHelper.responseHandler(err, req, res, next, destinations, message);
        });
      });
    });
  }
};