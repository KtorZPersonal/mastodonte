var cheerio = require('cheerio');
var zombie = require('request').defaults({jar: true});
var cp = require('./connectParams');

/* Open a session with a zombie account */
var connect = function(req, res, next){
  zombie.post({
    url: cp.host,
    form: {
      mail: cp.mail,
      passe: cp.password,
      connexion: "1"},
  }, function(err, response, body){
    req.connected = true;
    console.log("connected to website...");
    next();
  });
}

/* Extract data about a player, supposed that req contains a string param 'playerID' */
var information = function(req, res, next){
  req.information = {};
  if(req.connected){
    zombie.get({
      url:  cp.host,
      qs: {
        page: "ficheMembre",
        mec: req.body.username},
      }, function(err, response, body){
        var $ = cheerio.load(body);
        /* Extraire l'identifiant du joueur */ 
        var id = $('a[href^="/index.php?page=ficheMembre"]')
          .attr('href')
          .match(/=([0-9]+)$/);
        req.information.id = id && +id[1];

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