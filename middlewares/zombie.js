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
    req.cData.connected = true;
    next();
  });
};

/* Extract data about a player, supposed that req contains a string param 'playerID' */
var information = function(req, res, next){
  req.cData.information = {};
  if(!req.cData.connected) next();

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
      req.cData.information.id = id && +id[1];

      /* Extraire l'avatar du joueur */
      req.cData.information.avatar = $('.avatarimage').children('img').attr('src');

      next();
    });
};

/* Check for a particular email in the mailbox */
var checkMails = function(req, res, next){
  if(!req.cData.connected || !req.cData.user) return next();
  zombie.post({
    url: cp.host + "/index.php?page=messagerie&box=received",
    form: {
      'rech[BOURRIN]': "1",
      'rech[RECHGARS]': req.body.username}
    }, function(err, response, body){
      req.cData.keyFound = body.match(new RegExp(req.cData.user.verificationKeys[req.params.id])) != null;
      next();
  });
};

/* Retrieve infos about a fight */
var parseFight = function(req, res, next){
  var id = +req.body.idf;
  if(!id || !/^[0-9]+$/.test(id)) return next();
  zombie.get({
    url: cp.host + '/fr/seefight.php',
    qs: { idf: id },
  }, function(err, response, body){
    if(body.match(/Fight non existant/)) return next();

    var $ = cheerio.load(body);

    var fight = {
      players: {
        left: $('.fleft > h3').first().text(),
        right: $('.fright > h3').first().text()
      },
      characters: {
        left: $('.fleft .iconeperso').first().attr('src'),
        right: $('.fright .iconeperso').first().attr('src')
      },
      background: $('.scenecombat').attr('style').match(/url\((.*)\)/)[1],
      rounds: []
    };

    $('.cadrefightv3').each(function(i, elem){
      var newRound = {left:{}, right:{}};
      /* Round num */
      newRound.num = $('.numberround', elem).text();

      /* There is 9 .cadrefightv3, the two last one have no num, and don't matter */
      if(newRound.num != '') {
        /* Damages of both side */
        newRound.left.dmge = $('.fleft .barreattaque', elem).prev().text().match(/[0-9]+/);
        newRound.right.dmge = $('.fright .barreattaque', elem).prev().text().match(/[0-9]+/);
        newRound.right.dmge = newRound.right.dmge == null ? 0 : +newRound.right.dmge[0];
        newRound.left.dmge = newRound.left.dmge == null ? 0 : +newRound.left.dmge[0];

        /* Life of both side */
        newRound.left.life = +$('.fleft .barreattaque', elem).prev().prev().text().match(/[0-9]+/)[0];
        newRound.right.life = +$('.fright .barreattaque', elem).prev().prev().text().match(/[0-9]+/)[0];

        /* Mana of both side */
        newRound.left.mana = +$('.fleft .barremana', elem).prev().text().match(/[0-9]+/)[0];
        newRound.right.mana = +$('.fright .barremana', elem).prev().text().match(/[0-9]+/)[0];

        /* Absorption of both side */
        newRound.left.abso = +$('.fleft .barredefense', elem).prev().text().match(/[0-9]*\.?[0-9]+/)[0];
        newRound.right.abso = +$('.fright .barredefense', elem).prev().text().match(/[0-9]*\.?[0-9]+/)[0];

        /* Fighters Image */
        newRound.left.img = $('.gifgars1', elem).attr('src');
        newRound.right.img = $('.gifgars2', elem).attr('src');

        fight.rounds.push(newRound);
      }
    });

    req.cData.fight = fight;
    next();
  });
};

/* Do not forget to export */
module.exports = {
  connect: connect,
  information: information,
  checkMails: checkMails,
  parseFight: parseFight,
}