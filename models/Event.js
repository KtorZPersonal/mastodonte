var texts = require('../helpers/texts');

/* Event's shape, will only be used by inheritance */
var eventPlugin = function(schema, options){
  schema.add({
    name:       {type: String,    required: true}, 
    beginning:  {type: Date,      required: true},
    ending:     Date,
    fights:     [{type: Number,   ref: 'Fight'}],
    players:    [{type: Number,   ref: 'User'}],
    maxPlayers: {type: Number,    default: 100},
    minLevel:   {type: Number,    default: 1},
    maxLevel:   {type: Number,    default: 100}
  });

  /* Event's Validations */
  /* Some could have been done in the schema declaration, but it's nicer to have all of them in one place */

  /* Validate the name : string between 5 and 80 chars */
  schema.path('name').validate(function(value){
    return value && value.length < 80 && value.length >= 5;
  }, texts.build(texts.FR.VALIDATIONS.BETWEEN, {field: texts.FR.MODELS.EVENT.FIELDS.NAME, inf: 5, sup: 80}));

  /* Validate the beginning date : after the current day date */
  schema.path('beginning').validate(function(value){
    return true || value > new Date();
  }, texts.build(texts.FR.VALIDATIONS.INVALID, {field: texts.FR.MODELS.EVENT.FIELDS.BEGINNING}));

  /* Validate the ending date : after the beginning date */
  schema.path('ending').validate(function(value){
    return !value || (value > this.beginning);
  }, texts.build(texts.FR.VALIDATIONS.INVALID, {field: texts.FR.MODELS.EVENT.FIELDS.ENDING}));

  /* Validate the max number of players : an int > 0*/
  schema.path('maxPlayers').validate(function(value){
    return !value || (+value > 0 && +value % 1 == 0);
  }, texts.build(texts.FR.VALIDATIONS.STRICTSUP, {field: texts.FR.MODELS.EVENT.FIELDS.MAXPLAYERS, inf: 0}));

  /* Validate the minimum level required : a int between 1 and 100 */
  schema.path('minLevel').validate(function(value){
    return !value || (+value >= 1 && +value <= 100 && +value % 1 == 0);
  }, texts.build(texts.FR.VALIDATIONS.BETWEEN, {field: texts.FR.MODELS.EVENT.FIELDS.MINLEVEL, inf: 1, sup: 100}));

  /* Validate the maximum level required : an int between the min level and 100 */
  schema.path('maxLevel').validate(function(value){
    return !value || (+value >= this.minLevel && +value <= 100 && +value % 1 == 0);
  }, texts.build(
      texts.FR.VALIDATIONS.BETWEEN, {
        field: texts.FR.MODELS.EVENT.FIELDS.MAXLEVEL, 
        inf: texts.FR.MODELS.EVENT.FIELDS.MINLEVEL, 
        sup: 100
      }
    )
  );

};

module.exports = eventPlugin;