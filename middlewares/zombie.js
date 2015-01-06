var cheerio = require('cheerio');
var zombie = require('request').defaults({
  jar: true,
});

/**
* Open a session with a zombie account
* @param req Request param from Express.js
* @param res Response param from Exrepss.js
* @param next Next middleware to in queue
*/
var connect = function(req, res, next){
  zombie.post({
    url: "xxxxx",
    form: {
      mail: "xxxxx",
      passe: "xxxx",
      connexion: "1"},
  }, function(err, response, body){
    req.connected = true;
    next();
  });
}

/**
* Extract data about a player, supposed that req contains a string param 'searchedPlayer'
* @param req Request param from Express.js
* @param res Response param from Exrepss.js
* @param next Next middleware to in queue
*/
var information = function(req, res, next){
  req.information = {}
  if(req.connected){
    zombie.get({
      url:  "xxxxx",
      qs: {
        page: "ficheMembre",
        mec: req.params.searchedPlayer},
      }, function(err, response, body){
        var $ = cheerio.load(body);
        /* Extraire l'identifiant du joueur */ 
        req.information.id = +$('a[href^="/index.php?page=ficheMembre"]')
          .attr('href')
          .match(/=([0-9]+)$/)[1];

        /* Extraire l'avatar du joueur */
        req.information.avatar = $('.avatarimage').children('img').attr('src');

        next();
      });
  }
}

/* Do not forget to export */
module.exports = {
  connect: connect,
  information: information
}