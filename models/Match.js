var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
var eventPlugin = require('./Event');
var FrontendError = require('./FrontendError');
var errorHelper = require('../helpers/errors');
var texts = require('../helpers/texts');

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
}, texts.build(texts.FR.VALIDATIONS.STRICTSUP, {field: texts.FR.MODELS.MATCH.FIELDS.NBFIGHTS, inf: 0}));

/* Is a match started (thus, is it possible to register ?) */
matchSchema.methods.isStarted = function() {
  return Date.now() >= this.beginning.getTime();
};

/* Is a match ended (thus, is it possible to validate fight ?) */
matchSchema.methods.isEnded = function() {
  return this.nbFights <= 0 || this.ending && this.ending.getTime() <= Date.now();
};

/* Does a character respects the constraints */
matchSchema.methods.validsConstraints = function(character){
  return character.level <= this.maxLevel && character.level >= this.minLevel;
};

/* Does a player participate to the match */
matchSchema.methods.hasPlayer = function(playerId) {
  var hasPlayer = false;
  this.players.forEach(function(player){
    hasPlayer = hasPlayer || player._id == playerId;
  });
  return hasPlayer;
};

/* Before a suppression, unregister all users */
matchSchema.pre('remove', function(next) {
  console.log("lel");
  this.model('User').update(
    {'_id': {'$in': this.players}}, 
    {'$pull': {verifiedEvents: this._id}}, 
    {multi: true}, 
    next
  );
});

/* Match's behaviors */
var Match = mongoose.model('Match', matchSchema);

/* Retrieve all active matches. i.e. All matches that are not already ended */
var findAllActive = function(callback){
  var noEnding = {nbFights: {'$gt': 0}, ending: {'$exists': false}};
  var withEnding = {nbFights: {'$gt': 0}, ending: {'$gt': new Date()}};
  Match.find().or([noEnding, withEnding]).exec(function(err, matches){
    if(err) return callback(new FrontendError('UNKNOWN', err));
    callback(null, matches);
  });
};

/* Create and save a new match */
var create = function(params, callback){
  /* As params were formated by middlewares, it is possible to pass them directly to the constructor */
  Match.create(params, function(err, match){
    /* Required Error Helper is used to translate the error message of missing fields */
    errorHelper.format(err, texts.FR.MODELS.MATCH.FIELDS, function(err){
      callback(err, match);
    });
  });
};

/* Retrieve a match from the database */
var find = function(id, callback){
  Match.findOne({_id: id}).populate('players').exec(function(err, match) {
    if(err) return callback(new FrontendError('UNKNOWN', err));
    if(match == undefined) return callback(new FrontendError('ENTITY_NOT_FOUND', {entity: texts.FR.MODELS.MATCH.NAME}));
    callback(null, match);
  });
};

/* Delete a previously created event */
var remove = function(id, callback){
  Match.remove({_id: id}).exec(function(err) {
    if(err) return callback(new FrontendError('UNKNOWN', err));
    callback();
  });
};

/* Update and validate a match after modifications */
var update = function(id, params, callback){
  Match.findOne({_id: +id}).exec(function(err, match) {
    if(err) return callback(new FrontendError('UNKNOWN'));
    if(match == undefined) return callback(new FrontendError('ENTITY_NOT_FOUND', {entity: texts.FR.MODELS.MATCH.NAME}));
    /* Update each new params and save to apply validations */
    matchSchema.eachPath(function(path){
      if (!/^_/.test(path)) {
        match[path] = params[path];
      }
    });
    
    match.save(function(err){
      errorHelper.format(err, texts.FR.MODELS.MATCH.FIELDS, function(err){
        callback(err, match);
      })
    });
  });
};

/* Register a user as a participant */
var register = function(matchId, userId, callback) {
  Match.findOne({_id: matchId}).exec(function(err, match){
    if(err) return callback(new FrontendError('UNKNOWN'));
    if(match == undefined) return callback(new FrontendError('ENTITY_NOT_FOUND', {entity: texts.FR.MODELS.MATCH.NAME}));
    //if(match.players.contains(userId)) return callback(new FrontendError('INVALID_PARAM'));
    match.players.push(userId);
    match.save(function(err){
      errorHelper.format(err, texts.FR.MODELS.MATCH.FIELDS, function(err){
        callback(err, match);
      })
    });
  });
};

/* Validate a fight */
var validateFight = function(id, fight, callback){
  Match.findById(id, function(err, match){
    console.log(match);

    if(err) return callback(new FrontendError('UNKNOWN', err));
    if(match == undefined) return callback(new FrontendError('ENTITY_NOT_FOUND', {entity: texts.FR.MODELS.MATCH.NAME}));
    /* Check if the match is open for validation */
    if(!match.isStarted() || match.isEnded()) 
      return callback(new FrontendError('INVALID_ENTITY', {entity: texts.FR.MODELS.MATCH.NAME}));
    /* Check if users are registered for the match */
    if(!match.hasPlayer(fight.players.left) || !match.hasPlayer(fight.players.right))
      return callback(new FrontendError('USER_NOT_REGISTERED'));
    /* Check if characters respects match's constraints */
    if(!match.validsConstraints(fight.characters.left) || !match.validsConstraints(fight.characters.right))
      return callback(new FrontendError('CONSTRAINT_VIOLATED'));

    callback(null, match);
  });
};


/* Exports operations */
module.exports = {
  findAllActive: findAllActive,
  create: create,
  find: find,
  update: update,
  remove: remove,
  register: register,
  validateFight: validateFight
};




