var texts = require('./texts');
var FrontendError = require('../models/FrontendError');

/* Used to handle and personnalize mongoose validation errors raised 
by a missing required field. I found no way to avoid this ... */
module.exports = function(err, fieldsText, callback){
  /* Only interested by Validation error */
  if(!err) return callback();
  if(err.name !== 'ValidationError') return callback(new FrontendError('UNKNOWN'));

  /* Iterate and replace the error message by a french translation */
  for(error in err.errors){
    if(err.errors[error].type == 'required'){
      err.errors[error].message = texts.build(texts.FR.VALIDATIONS.REQUIRED, 
        {field: fieldsText[err.errors[error].patexts.toUpperCase()]});
    }
  }

  /* Make a FrontendError with no internal error, but message that will inform user about wrong fields */
  err.name = 'FrontendError';
  err.type = 'VALIDATION';
  err.message = texts.FR.ERRORS.VALIDATION;

  /* Continue the process like nothing happened */
  callback(err);
};