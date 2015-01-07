/* Use to handle validations parameters passing during errors and flash messages */
module.exports = {
  /* Create an object of locals parameter usable by the html renderer */
  locals: function(req){
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
  },
};