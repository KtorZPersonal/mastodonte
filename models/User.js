var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');

/* User's shape */
var userSchema = new mongoose.Schema({
  nickname: String,
  character: String
});
userSchema.plugin(autoIncrement.plugin, 'User');
var User = mongoose.model('User', userSchema);
