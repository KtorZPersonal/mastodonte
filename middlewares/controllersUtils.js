var FrontendError = require('../models/FrontendError');
var User = require('../models/User');

module.exports = {
  /* Middleware called before any other middleware during the routing process. 
  Just create an empty object used to store data manipulated by controllers without
  interfering with any other component */
  init: function(req, res, next) {
    req.cData = {};
    next();
  },

  /* This middleware is use in order to take values from inputs representating a date.
  As a reminder, an event can be defined by a day, a month and an hour. The year depends
  of the current year. So, it is possible to plan event only one year before (and it's well enough).
  For instance, let today be the 25 January 2015.
  User enter 14 as day, march as month, and 2:00PM. So, this middleware will delete those tree 
  arguments and replace them by a date > 14 march 2015 14:00. If the user enter 12 January 00:00, 
  the date should be 12 january 2016 00:00. 
  It is important that the input should be name day_[some_suffix], month_[some_suffix], hour_[some_suffix].
  The date will be add to req.body as some_suffix.
  */
  parseDate: function(req, res, next) {
    /* Check for potential date params. i.e. day_something, month_something, hour_something */
    for (param in req.body) {
      if (/^day_/.test(param)) {
        var suffix = param.split('_')[1];

        /* Check if other params have correctly been sent and defined */
        var day = req.body['day_' + suffix];
        day = +day > 0 && +day <= 31 && +day % 1 == 0 && day;
        var month = req.body['month_' + suffix];
        month = +month > 0 && +month <= 12 && +month % 1 == 0 && month;
        var hour = req.body['hour_' + suffix];
        hour = +hour >= 0 && +hour <= 23 && +hour % 1 == 0 && hour;

        if (!(day && month && hour)) return next();

        /* Build the correct date and add it to the other params */
        var date = new Date();
        var year = date.getFullYear();
        if (date.getMonth() + 1 > month) {
          year++;
        } else if (date.getMonth() + 1 == month) {
          if (date.getDate() >= day) {
            year++;
          }
        }
        req.body[suffix] = new Date(year+"-"+month+"-"+day+" "+hour+":00");

        /* Clear previous params */
        delete req.body['day_' + suffix];
        delete req.body['month_' + suffix];
        delete req.body['hour_' + suffix];
      }
    }
    next();
  },

  ensureParams: {
    id: function(destination) {
      return (function(req, res, next, id) {
        var error = /^[0-9]+$/.test(id) ? null : new FrontendError('INVALID_PARAM', destination);
        if(!error) req.params.id = +id; // Cast in int
        next(error);
      });
    }
  },

  /* Populate users of a fight from their username */
  retrieveUsers: function(req, res, next) {
    if(!req.cData.fight) return next();
    User.findByUsername(req.cData.fight.players.left, function(err, user){
      if(err) return next(err.to('/error'));
      req.cData.fight.players.left = user;
      User.findByUsername(req.cData.fight.players.right, function(err, user){
        if(err) return next(err.to('/error'));
        req.cData.fight.players.right = user;
        next();
      });
    });
  },
};