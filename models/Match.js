var mongoose = require('mongoose');
var eventPlugin = require('./Event');
var requiredErrorHelper = require('../helpers/requiredError');
var autoIncrement = require('mongoose-auto-increment');
var ModelError = require('./ModelError');
var th = require('../helpers/textHandler');

/* Match's shape */
var matchSchema = new mongoose.Schema({
  nbFights: {type: Number, required: true}
});
matchSchema.plugin(autoIncrement.plugin, 'Match');
/* Inheritance from event*/
matchSchema.plugin(eventPlugin);

/* Match's validations */

/* Validate nbFights : we want a positive integer */
matchSchema.path('nbFights').validate(function(value){
  return /^-?[0-9]+$/.test(value) && +value > 0;
}, th.build(th.FR.VALIDATIONS.STRICTSUP, {field: th.FR.MODELS.MATCH.FIELDS.NBFIGHTS, inf: 0}));

/* Match's behaviors */
var Match = mongoose.model('Match', matchSchema);

/* Retrieve all active matches. i.e. All matches that are not already ended */
var findAllActive = function(callback){
  Match.where('nbFights').gt(0).exec(callback);
};

/* Create and save a new match */
var create = function(params, callback){
  /* As params were formated by middlewares, it is possible to pass them 
  directly to the constructor */
  Match.create(params, function(err, match){
    /* Required Error Helper is used to translate the error message of missing fields */
    requiredErrorHelper(err, th.FR.MODELS.MATCH.FIELDS, function(err){
      callback(err, match);
    })
  });
};

/* Retrieve a match from the database */
var find = function(id, callback){
  if(!/^[0-9]+$/.test(id)) return callback(new ModelError('INVALID_PARAM'));
  Match.findOne({_id: +id}).exec(function(err, match){
    if(err) return callback(new ModelError('UNKNOWN'));
    if(match == null) return callback(new ModelError('ENTITY_NOT_FOUND', {entity: th.FR.MODELS.MATCH.NAME}));
    callback(null, match);
  });
}

/* Delete a previously created event */
var remove = function(id, callback){
  if(!/^[0-9]+$/.test(id)) return callback(new ModelError('INVALID_PARAM'));
  Match.remove({_id: +id}).exec(function(err){
    if(err) return callback(new ModelError('UNKNOWN'));
    callback();
  });
}

/* Update and validate a match after modifications */
var update = function(id, params, callback){
  if(!/^[0-9]+$/.test(id)) return callback(new ModelError('INVALID_PARAM'));
  Match.findOne({_id: +id}).exec(function(err, match){
    if(err) return callback(new ModelError('UNKNOWN'));
    if(match == null) return callback(new ModelError('ENTITY_NOT_FOUND', {entity: th.FR.MODELS.MATCH.NAME}));
    /* Update each new params and save to apply validations */
    matchSchema.eachPath(function(path){
      if (!/^_/.test(path)) {
        match[path] = params[path];
      }
    });

    console.log(match);
    
    match.save(function(err){
      requiredErrorHelper(err, th.FR.MODELS.MATCH.FIELDS, function(err){
        callback(err, match);
      })
    });
  });
}

/* Exports operations */
module.exports = {
  findAllActive: findAllActive,
  create: create,
  find: find,
  update: update,
  remove: remove
};




