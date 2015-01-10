var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
var bcrypt = require('bcrypt-nodejs');
var requiredErrorHelper = require('../helpers/requiredError');
var th = require('../helpers/textHandler');
var ModelError = require('./ModelError');

/* User's shape */
var userSchema = new mongoose.Schema({
  username: {type: String, required: true, unique: true},
  id2f: {type: Number, required: true},
  type: {type: String, required: true},
  avatar: {type: String, required: true},
  /* Change the ref between different events */
  verifiedEvents: [{type: Number, ref: 'Match'}],
  /* An object that associate an event id to a secret validation key */
  verificationKeys: {type: mongoose.Schema.Types.Mixed},
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
  if(this.type == User.TYPES.PLAYER) return cb(new ModelError('AUTHENTICATION'));
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if(err) return cb(new ModelError('UNKNOWN'));
    cb(null, isMatch);
  });
};

/* TODO! Validations */



/* User's behavior */
var User = mongoose.model('User', userSchema);
User.TYPES = {
  PLAYER: 'player',
  MODERATOR: 'moderator'
};

/* Create a new user and save him in the db */
var create = function(params, callback){
  User.create(params, function(err, user){
    /* Required Error Helper is used to translate the error message of missing fields */
    requiredErrorHelper(err, th.FR.MODELS.USER.FIELDS, function(err){
      callback(err, user);
    });
  });
};

/* Find a user by ID */
var findById = function(id, callback){
  if(!/^[0-9]+$/.test(id)) return callback(new ModelError('INVALID_PARAM'));
  User.findOne({_id: id}).populate('verifiedEvents').exec(function(err, user){
    if(err) return callback(new ModelError('UNKNOWN'));
    if(user == null) return callback(new ModelError('ENTITY_NOT_FOUND', {entity: th.FR.MODELS.USER.NAME}));
    callback(null, user);
  });
};

/* Find a user by username */
var findByUsername = function(username, callback){
  if(!/^[a-zA-Z0-9_\.-]+$/.test(username)) return callback(new ModelError('INVALID_PARAM'));
  User.findOne({username: username}).populate('verifiedEvents').exec(function(err, user){
    if(err) return callback(new ModelError('UNKNOWN'));
    if(user == null) return callback(new ModelError('ENTITY_NOT_FOUND', {entity: th.FR.MODELS.USER.NAME}));
    callback(null, user);
  });
};

/* Update a user */
var update = function(user, callback){
  /* Can't call directly user.save.... Why ? Mongoose ? Didn't find the answer yet */
  User.findById(user._id, function(err, dbUser){ 
    for(p in user.schema.paths) dbUser[p] = user[p];
    dbUser.save(function(err, updated, affected){
      callback(err ? new ModelError('UNKNOWN') : null);
    });
  });
}


/* Generate a key for validate a registration */
var genValidationKey = function(){
  var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split('');
  var key = "";
  for(var i = 0; i < 28; i++) key += chars[Math.floor(Math.random()*62)];
  return key;
};


module.exports = {
  create: create,
  findById: findById,
  findByUsername: findByUsername,
  TYPES: User.TYPES,
  genValidationKey: genValidationKey,
  update: update
};