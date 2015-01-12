module.exports = {
  /* Middleware called before any other middleware during the routing process. 
  Just create an empty object used to store data manipulated by controllers without
  interfering with any other component */
  init: function(req, res, next) {
    req.cData = {};
    next();
  },

  /* Retieve data on participants */
  retrieveUsers: function(req, res, next) {
    /* If there is no fight, don't even try to access users */
    if(!req.cData.fight) return next();

    /* Each user will be retrieved in the same time, so an handler will
    be call two times, on each retrieving. After the second, middleware can
    go further */
    var finished = 0; var errors = []; 
    var handler = function(err, user, side) {
      finished++;
      if(err) errors.push(err);
      req.cData.fight.players[side] = user;

      /* When both retrieving have been done */
      if(finished == 2) {
        /* On errors, invalidate the object fight */
        if(errors.length > 0) delete req.cData.fight;
        next();
      }
    };

    /* Retrieve each participants */
    User.findByUsername(req.cData.fight.players.left, function(err, user){
      handler(err, user, 'left');
    });
    User.findByUsername(req.cData.fight.players.right, function(err, user){
      handler(err, user, 'right');
    });
  },


};