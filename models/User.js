var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
var bcrypt = require('bcrypt-nodejs');
var requiredErrorHelper = require('../helpers/requiredError');
var th = require('../helpers/textHandler');
var ModelError = require('./ModelError');

/* User's shape */
var userSchema = new mongoose.Schema({
  username: {type: String, required: true, unique: true},
  password: {type: String, required: true}
});
userSchema.plugin(autoIncrement.plugin, 'User');

/* Encrypt a password */
userSchema.pre('save', function(next) {
  var user = this;
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
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if(err) return cb(new ModelError('UNKNOWN'));
    cb(null, isMatch);
  });
};
var User = mongoose.model('User', userSchema);


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
  User.findOne({_id: id}).exec(function(err, user){
    if(err) return callback(new ModelError('UNKNOWN'));
    if(user == null) return callback(new ModelError('ENTITY_NOT_FOUND', {entity: th.FR.MODELS.USER.NAME}));
    callback(null, user);
  });
}

/* Find a user by username */
var findByUsername = function(username, callback){
  if(!/^[a-zA-Z0-9_\.-]+$/.test(username)) return callback(new ModelError('INVALID_PARAM'));
  User.findOne({username: username}).exec(function(err, user){
    if(err) return callback(new ModelError('UNKNOWN'));
    if(user == null) return callback(new ModelError('ENTITY_NOT_FOUND', {entity: th.FR.MODELS.USER.NAME}));
    callback(null, user);
  });
}

module.exports = {
  create: create,
  findById: findById,
  findByUsername: findByUsername
};