var th = require('../helpers/textHandler');

/* Personnalized error */
/* type = UNKOWN / INVALID_PARAM / ENTITY_NOT_FOUND / VALIDATION */
var ModelError = function(type, options){
  var error = new Error(th.build(th.FR.ERRORS[type], options));
  error.type = type;
  error.name = 'ModelError';
  return error;
}

module.exports = ModelError;