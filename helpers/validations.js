/* Use to handle validations parameters passing during errors and flash messages */
module.exports = {
  /* Create an object of locals parameter usable by the html renderer */
  locals: function(req){
    var messages = {
      alert: req.flash('alert'),
      info: req.flash('info')
    };

    var params = req.session.params || {}; 
    delete req.session.params;

    var errors = {};
    if (messages.alert.length > 0) {
      /* Join previous params to the response */
      errors = req.session.validationErrors || errors;
      delete req.session.validationErrors;
    }

    /* Special handle for date */
    for (var p in params)
      if(params[p].datetype) params[p] = new Date(params[p].timestamp);

    return {params: params, errors: errors, messages: messages};
  },
};