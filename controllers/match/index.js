var router = require('express').Router();
var validationsHelper = require('../../helpers/validations');
var Match = require('../../models/Match');

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

router.use('/:id', require('./register'));
router.use('/:id', require('./validate'));

module.exports = router;