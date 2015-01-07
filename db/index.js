var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');

/* Handle connection with the database MongoDB */
var db = mongoose.connect('mongodb://localhost/mastodon');

/* Auto Increment will allow us to have auto-increment ids on each document in db */
autoIncrement.initialize(mongoose.connection);

/* Log out some messages */
mongoose.connection.on('connected', function() {
  console.log("Connected to MongoDB...");
});

module.exports = db;