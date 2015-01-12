var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
var requiredErrorHelper = require('../helpers/requiredError');
var ModelError = require('./ModelError');
var th = require('../helpers/textHandler');

/* Fight's shape 
  Rounds is an array of object that will handle every data about each round in the fight
  (damages, manas, lives, absorptions and images);
  Characters will contains both avatar and name for the two opponents
*/
var fightSchema = new mongoose.Schema({
  players: [{type: Number, ref: 'User', required: true}],
  rounds: [{type: mongoose.Schema.Types.Mixed, required: true}],
  background: {type: String, required: true},
  characters: [{type: mongoose.Schema.Types.Mixed, required: true}],
  winner: {type: Number, required: true},
  date: {type: Date, required: true}
});
fightSchema.plugin(autoIncrement.plugin, 'Fight');

/* Create a model corresponding to that schema */
var Fight = mongoose.model('Fight', fightSchema);
/* Indices for accessing data in the fight */
Fight.LEFT = 0;
Fight.RIGHT = 1;

/* Validations missing */

/* Fight's behaviors */

/* Create a new fight and save it in the database*/
var create = function(params, callback) {
  Fight.create(params, err){
    requiredErrorHelper(err, th.FR.MODELS.FIGHT.FIELDS, function(err){
      callback(err, match);
    });
  };
};

var module.exports = {
  create: create,

}