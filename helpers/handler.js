/* A global handler for interactions with the model */
/* Create an object of locals parameter usable by the html renderer */
var locals = function(req){
  var messages = {
    alert: req.flash('alert'),
    info: req.flash('info')
  };

  /* Join previous posted params to the response */
  var data = req.session.params || {}; 
  delete req.session.params;
  
  /* Special handle for date */
  for (var p in data)
    if(data[p].datetype) data[p] = new Date(data[p].timestamp);

  /* Add also param in querystring */
  for(p in req.params) data[p] = req.params[p];

  /* Add errors if there is some */
  var errors = {};
  if (messages.alert.length > 0) {
    errors = req.session.validationErrors || errors;
    delete req.session.validationErrors;
  }

  return {data: data, errors: errors, messages: messages};
};

/* General response handler to handle action from model done by a controller */
var responseHandler = function(err, req, res, next, destinations, successMessage, data){
  /* Firstly, look at the error, if there is one. Validation errors have specific handling.  */
  if(err && err.name != 'ValidationError') return next(err.to(destinations.failure.path));
  
  /* The error is a ValidationError, so let's handle it properly. Those kind of errors are not handled by the global
  error handling as they are validation errors. They only appear when a user try to create an entity in the database
  by posting a filled form. We want those errors to be pass through session in order to be communicated to the user */
  if(err) {
    /* Let's display a pre-filled form with previous parameters. Hence, they have to be communicated */
    req.session.validationErrors = err.errors;

    req.session.params = {};
    for (var p in req.body) {
      /* Special handle for date, we want to keep the method after the session */
      req.session.params[p] = (req.body[p] instanceof Date) 
        ? {datetype: true, timestamp: req.body[p].getTime()}
        : req.session.params[p] = req.body[p]; 
    }

    /* Add also param in querystring */
    for(p in req.params) req.session.params[p] = req.params[p];
    
    /* With a little alert message to inform the user he fucked up */
    req.flash('alert', err.message);
    return res.redirect(destinations.failure.path);
  }

  /* If everything is good, let's display the success page and inform the user */
  /* First, handle optionnal params */
  if(typeof(successMessage) != 'string') {
    data = successMessage;
    successMessage = undefined;
  }
  if(successMessage) req.flash('info', successMessage);
  delete req.session.params
  delete req.session.validationErrors

  /* Then, redirect or display the page */
  if(destinations.success.style == 'redirect') {
    res.redirect(destinations.success.path);
  } else {
    /* For a rendering, add data passed by models and/or controller */
    var _locals = locals(req);
    if(data) _locals.data = data;
    res.render(destinations.success.path, _locals);
  }
};

/* Use to handle validations parameters passing during errors and flash messages */
module.exports = {
  locals: locals,
  responseHandler: responseHandler
};