/* Use to handle validations parameters passing during errors and flash messages */
module.exports = {
  /* Create an object of locals parameter usable by the html renderer */
  locals: function(req, datesKey){
    var messages = {
      alert: req.flash('alert'),
      info: req.flash('info')
    };
    var params = {}; var errors = {};
    if (messages.alert.length > 0) {
      /* Join previous params to the response */
      params = req.session.params || params;
      errors = req.session.validationErrors || errors;
      delete req.session.param;
      delete req.session.validationErrors;
    }

    (datesKey || []).forEach(function(key){
      if (params[key]) params[key] = new Date(params[key]);
    });

    return {params: params, errors: errors, messages: messages};
  },
};