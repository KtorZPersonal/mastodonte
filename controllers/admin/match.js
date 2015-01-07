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
    modelResponseHandler(err, req, res, messages, destinations, match);
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

      modelResponseHandler(err, req, res, messages, destinations, match);
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
    modelResponseHandler(err, req, res, messages, destinations, match);
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

    modelResponseHandler(err, req, res, messages, destinations, match);
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
    modelResponseHandler(err, req, res, messages, destinations);
  });
});


/* A global handler for interactions with the model */
var modelResponseHandler = function(err, req, res, messages, destinations, match){
  var situation = 'success';
  if (err && err.name == 'ModelError') {
    if (err.type == 'VALIDATION') {
      /* Validation Error, let's display the pre-filled form again 
      So, previous parameters have to be communicated */
      req.session.validationErrors = err.errors;

      req.session.params = {};
      for (var param in req.body) {
        /* Special handle for date, we want to keep the method after the session */
        req.session.params[param] = (req.body[param] instanceof Date) 
          ? {datetype: true, timestamp: req.body[param].getTime()}
          : req.session.params[param] = req.body[param]; 
      }

      /* Add also param in querystring */
      for(p in req.params) req.session.params[p] = req.params[p];
    }
    /* With a little alert message to inform the user he fucked up */
    req.flash('alert', messages.alert);
    situation = 'failure';
  } else {
    /* If everything is good, let's display the success page and inform the user */
    if(messages.info) req.flash('info', messages.info);
    delete req.session.params
    delete req.session.validationErrors
  }

  /* Then, redirect or display the page */
  if(destinations[situation].style == 'redirect') {
    res.redirect(destinations[situation].path);
  } else {
    var locals = validationsHelper.locals(req);
    if(situation == 'success' && match) locals.data = match;
    res.render(destinations[situation].path, locals);
  }
}

/* Export as a middleware to be use in the global routing handler */
module.exports = router;