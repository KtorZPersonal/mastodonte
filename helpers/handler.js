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

  /* Add errors if there is some */
  var errors = {};
  if (messages.alert.length > 0) {
    errors = req.session.validationErrors || errors;
    delete req.session.validationErrors;
  }

  return {data: data, errors: errors, messages: messages};
};

var responseHandler = function(err, req, res, messages, destinations, data){
  var situation = err ? 'failure' : 'success';
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
    var _locals = locals(req);
    if(data) _locals.data = data;
    res.render(destinations[situation].path, _locals);
  }
};

/* Use to handle validations parameters passing during errors and flash messages */
module.exports = {
  locals: locals,
  responseHandler: responseHandler
};