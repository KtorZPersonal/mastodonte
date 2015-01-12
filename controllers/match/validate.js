var router = require('express').Router();
var validationsHelper = require('../../helpers/validations');
var Match = require('../../models/Match');
var User = require('../../models/User');
var th = require('../../helpers/textHandler');
var z = require('../../middlewares/zombie');
var utils = require('../../middlewares/controllerUtils');

/* Validate a fight in a specific event */
router.post('/:id/validate', z.parseFight, utils.retrieveUsers, function(req, res){
  var matchId = req.params.id;
  var destination = '/match/' + matchId + "/show";
  var messages = {
    failure : th.SERVICES.VALIDATE.FAILURE,
    info: th.FR.SERVICES.VALIDATE.SUCCESS
  };

  var destinations = {
    failure: {type: 'redirect', path: destination},
    success: {type: 'redirect', path: destination}
  };

  /* Return an error if there is a problem */
  if(!req.cData.fight) {
    req.flash('alert', messages.failure);
    return res.redirect(destinations.failure);
  }

  /* Check if the fight is valid */
  Match.validateFight(matchId, req.cData.fight, function(err, match){
    if(err) {
      req.flash('alert', err.message);
      return res.redirect(destinations.failure);
    }

    /* Create the fight in the db */
    Fight.create(req.fight, function(err, fight){
      if(err) {
        req.flash('alert', err.message);
        return res.redirect(destinations.failure);
      }      
      /* Add the fight to others */
      match.fights.push(fight.id);
      Match.update(match.id, match, function(err, fight){
        messages.alert = err && err.messages;
        validationsHelper.responseHandler(err, req, res, messages, destinations);
      });
    });
  });
})

module.exports = router;