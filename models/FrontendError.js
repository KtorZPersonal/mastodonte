var texts = require('../helpers/texts');

/* Personnalized error that should be transmitted to the user. It is a container for a real system error which will 
  only appear in logs. */
module.export = function(type, options, err) {
    var error = new Error(texts.build(texts.FR.ERRORS[type], options));
    error.type = type;
    error.name = 'FrontendError';
    error.internalError = err;
    return error;
};