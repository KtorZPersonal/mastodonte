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
    next();
  });
};

/* Extract data about a player, supposed that req contains a string param 'playerID' */
var information = function(req, res, next){
  req.information = {};
  if(!req.connected) next();

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
};

/* Check for a particular email in the mailbox */
var checkMails = function(req, res, next){
  if(!req.connected || !req.user) return next();
  zombie.post({
    url: cp.host + "/index.php?page=messagerie&box=received",
    form: {
      'rech[BOURRIN]': "1",
      'rech[RECHGARS]': req.body.username}
    }, function(err, response, body){
      req.keyFound = body.match(new RegExp(req.user.verificationKeys[req.params.id])) != null;
      next();
  });
};

var temp = function(req, res, next){
  req.body = {
    username: "ZellDintch"
  };
  next();
};

/* Do not forget to export */
module.exports = {
  connect: connect,
  information: information,
  temp: temp,
  checkMails: checkMails
}