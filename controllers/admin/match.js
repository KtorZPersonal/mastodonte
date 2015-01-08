/* Routes about matches */
var router = require('express').Router();
var dateParser = require('./../../middlewares/dateParser');
var validationsHelper = require('../../helpers/validations');
var Match = require('../../models/Match');
var th = require('../../helpers/textHandler');

/* Display form to create a new match */
router.get('/new', function(req, res){
  res.render('admin/match/new', validationsHelper.locals(req));
});

/* Handle the post for creating a new match */
router.post('/new', dateParser, function(req, res){
  Match.create(req.body, function(err, match) {
    var messages = {
      alert: err && err.message,
      info: th.build(th.FR.SERVICES.CREATE.SUCCESS, {entity: th.FR.MODELS.MATCH.NAME})
    };

    var destinations = {
      failure: {style: 'redirect', path: 'new'},
      success: {style: 'redirect', path: '/admin'}
    };
    validationsHelper.responseHandler(err, req, res, messages, destinations, match);
  });
});

/* Edit a previously created event. Quite similar to the creation */
router.get('/:id/edit', function(req, res){
  /* Two cases : coming from normal get, and coming from redirection after bad update */
  if(req.session.params) {
    /* Update try */
    res.render('admin/match/edit', validationsHelper.locals(req));
  } else {
    /* Find the match first */
    Match.find(req.params.id, function(err, match){
      var messages = { alert: err && err.message };

      var destinations = {
        failure: {style: 'redirect', path: '/admin'},
        success: {style: 'render', path: 'admin/match/edit'}
      };

      validationsHelper.responseHandler(err, req, res, messages, destinations, match);
    });
  }
});

/* Update the match. Http verb should technically be "put" but... maybe in some years */
router.post('/:id/edit', dateParser, function(req, res){
  Match.update(req.params.id, req.body, function(err, match){
    var messages = {
      alert: err && err.message,
      info: th.build(th.FR.SERVICES.UPDATE.SUCCESS, {entity: th.FR.MODELS.MATCH.NAME})
    };

    var destinations = {
      failure: {style: 'redirect', path: 'edit'},
      success: {style: 'redirect', path: 'show'}
    };
    validationsHelper.responseHandler(err, req, res, messages, destinations, match);
  });
});

/* Display all informations about a specific match */
router.get('/:id/show', function(req, res){  
  Match.find(req.params.id, function(err, match){
    var messages = { alert: err && err.message };

    var destinations = {
      failure: {style: 'redirect', path: '/admin'},
      success: {style: 'render', path: 'admin/match/show'}
    };

    validationsHelper.responseHandler(err, req, res, messages, destinations, match);
  });
});

/* Delete a match. Http verb should be "delete" */
router.post('/:id/delete', function(req, res){
  Match.remove(req.params.id, function(err){
    var messages = {
      alert: err && err.message,
      info: th.build(th.FR.SERVICES.DELETE.SUCCESS, {entity: th.FR.MODELS.MATCH.NAME})
    };

    var destinations = {
      failure: {style: 'redirect', path: '/admin'},
      success: {style: 'redirect', path: '/admin'}
    };
    validationsHelper.responseHandler(err, req, res, messages, destinations);
  });
});

/* Export as a middleware to be use in the global routing handler */
module.exports = router;