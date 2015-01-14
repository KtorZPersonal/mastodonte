var texts = require('../helpers/texts');

/* Personnalized error that should be transmitted to the user. It is a container for a real system error which will 
  only appear in logs. 
  @param {String} type The type of the error, should be the same as in texts helper
  @param {Object} option Additionnal information about the error that will be required by text helper
  @param {String} destination The failure destination to which the user should be redirected
  @param {Error} err The original error that should be encapsuled
*/
var FrontendError = function(type, options, destination, err) {
  /* Override the name */
  this.name = 'FrontendError';

  /* Handle optionnal parameters */
  if(options instanceof Error) {
    err = options;
    options = undefined;
  }

  if(destination instanceof Error) {
    err = destination;
    destination = undefined;
  }

  if(typeof(options) == 'string') {
    destination = options;
    options = undefined;
  }

  /* Define properly the error */
  this.message = texts.build(texts.FR.ERRORS[type], options);
  this.type = type;
  this.destination = destination;
  this.internalError = err;
};

/* Extends from Error */
FrontendError.prototype = Object.create(Error.prototype);
FrontendError.prototype.constructor = FrontendError;

/* Used to add a destination and returning the updated error. This is useful to quickly handle errors coming from
models which dont define the destination */
FrontendError.prototype.to = function(destination) {
  this.destination = destination;
  return this;
};

module.exports = FrontendError;

