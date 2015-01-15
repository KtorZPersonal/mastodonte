var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
var FrontendError = require('./FrontendError');
var errorHelper = require('../helpers/errors');
var texts = require('../helpers/texts');

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



/* Create a model corresponding to textsat schema */
var Fight = mongoose.model('Fight', fightSchema);

/* Indices for accessing data in the fight */

/* Validations TODO */

/* Fight's behaviors */

/* Create a new fight and save it in the database*/
var create = function(params, callback) {
  Fight.create(params, function(err, fight){
    errorHelper.format(err, texts.FR.MODELS.FIGHT.FIELDS, function(err){
      callback(err, match);
    });
  });
};



module.exports = {
  create: create,
}