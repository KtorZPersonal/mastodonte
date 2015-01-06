var th = require('./textHandler');
var ModelError = require('../models/ModelError');

/* Used to handle and personnalize mongoose validation errors raised 
by a missing required field. I found no way to avoid this ... */
module.exports = function(err, fieldsText, callback){
  /* Only interested by Validation error */
  if(!err) return callback();
  if(err.name !== 'ValidationError') return callback(new ModelError('UNKNOWN'));

  /* Iterate and replace the error message by a french translation */
  for(error in err.errors){
    if(err.errors[error].type == 'required'){
      err.errors[error].message = th.build(th.FR.VALIDATIONS.REQUIRED, 
        {field: fieldsText[err.errors[error].path.toUpperCase()]});
    }
  }

  err.name = 'ModelError';
  err.type = 'VALIDATION';
  err.message = th.FR.ERRORS.VALIDATION;

  /* Continue the process like nothing happened */
  callback(err);
}