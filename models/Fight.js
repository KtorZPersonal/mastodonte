var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');

/* Fight's shape */
var fightSchema = new mongoose.Schema({
  players: [{type: Number, ref: 'User'}],
  winner: Number,
  date: Date
});
fightSchema.plugin(autoIncrement.plugin, 'Fight');
var Fight = mongoose.model('Fight', fightSchema);

/* Fight's behaviors */