var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
var bcrypt = require('bcrypt-nodejs');
var FrontendError = require('./FrontendError');
var errorHelper = require('../helpers/errors');
var texts = require('../helpers/texts');

/* User's shape */
var userSchema = new mongoose.Schema({
  username: {type: String, required: true, unique: true},
  id2f: {type: Number, required: true},
  type: {type: String, required: true},
  avatar: {type: String, required: true},
  verifiedEvents: [{type: Number, ref: 'Match'}],
  password: {type: String}
});
userSchema.plugin(autoIncrement.plugin, 'User');

/* Encrypt a password */
userSchema.pre('save', function(next) {
  var user = this;
  /* There is 2 kind of user. */
  if(user.type == User.TYPES.PLAYER) return next();
  if(!user.isModified('password')) return next();
  bcrypt.genSalt(10, function(err, salt) {
    if(err) return next(err);
    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if(err) return next(err);
        user.password = hash;
        next();
      });
  });
});

/* Verify a password*/
userSchema.methods.comparePassword = function(candidatePassword, cb) {
  if(this.type == User.TYPES.PLAYER) return cb(new FrontendError('AUTHENTICATION'));
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if(err) return cb(new FrontendError('UNKNOWN', err));
    cb(null, isMatch);
  });
};

/* Check if a user is registered for a match */
userSchema.methods.isRegisteredFor = function(matchId){
  var isAlreadyRegistered = false;
  this.verifiedEvents.forEach(function(match){
    isAlreadyRegistered = isAlreadyRegistered || match._id == matchId;
  });
  return isAlreadyRegistered;
};

/* TODO! Validations */


/* User's behavior */
var User = mongoose.model('User', userSchema);

/* Create a new user and save him in the db */
var create = function(params, callback){
  User.create(params, function(err, user){
    /* Required Error Helper is used to translate the error message of missing fields */
    errorHelper.format(err, texts.FR.MODELS.USER.FIELDS, function(err){
      callback(err, user);
    });
  });
};

/* Find a user by ID */
var findById = function(id, callback){
  User.findOne({_id: id}).populate('verifiedEvents').exec(function(err, user){
    if(err) return callback(new FrontendError('UNKNOWN', err));
    if(user == undefined) return callback(new FrontendError('ENTITY_NOT_FOUND', {entity: texts.FR.MODELS.USER.NAME}));
    callback(null, user);
  });
};

/* Find a user by username */
var findByUsername = function(username, callback){
  User.findOne({username: username}).populate('verifiedEvents').exec(function(err, user){
    if(err) return callback(new FrontendError('UNKNOWN', err));
    if(user == undefined) return callback(new FrontendError('ENTITY_NOT_FOUND', {entity: texts.FR.MODELS.USER.NAME}));
    callback(null, user);
  });
};

/* Update a user */
var update = function(id, params, callback){
  /* Can't call directly user.save.... Why ? Mongoose ? Didn't find the answer yet */
  User.findById(id, function(err, user){ 
    userSchema.eachPath(function(path){
      if (!/^_/.test(path)) user[path] = params[path];
    });
    user.save(function(err){
      errorHelper.format(err, texts.FR.MODELS.USER.FIELDS, function(err){
        callback(err, user);
      })
    });
  });
};

/* Register a user for a match */
var register = function(userParams, matchId, callback){
  findByUsername(userParams.username, function(err, user){
    if(err && err.type != 'ENTITY_NOT_FOUND') return callback(err);
    if(err) {
      /* User don't exist */
      userParams.verifiedEvents = [matchId];
      create(userParams, callback);
    } else {
      /* It exists, just update him */
      if(user.isRegisteredFor(matchId)) return callback(new FrontendError('ALREADY_REGISTERED'));
      user.verifiedEvents.push(matchId);
      user.avatar = userParams.avatar;
      update(user.id, user, callback);
    }

  });
};

/* Generate a key for validate a registration */
var genValidationKey = function(){
  var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split('');
  var key = "";
  for(var i = 0; i < 28; i++) key += chars[Math.floor(Math.random()*62)];
  return "g5L3yRpXAAaNJklgK4Qy939ZjYX3"; // temp
  return key;
};

var createShape = function(username, id2f, avatar){
  return {
    username: username,
    id2f: id2f,
    avatar: avatar,
    type: User.TYPES.PLAYER
  };
};

User.TYPES = {
  PLAYER: 'player',
  MODERATOR: 'moderator'
};

module.exports = {
  create: create,
  findById: findById,
  findByUsername: findByUsername,
  TYPES: User.TYPES,
  genValidationKey: genValidationKey,
  update: update,
  register: register,
  createShape: createShape
};