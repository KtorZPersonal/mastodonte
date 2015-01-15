var cheerio = require('cheerio');
var zombie = require('request').defaults({jar: true});
var FrontendError = require('../models/FrontendError');
var cp = require('./connectParams');

/* Open a session with a zombie account */
var connect = function(req, res, next){
  zombie.post({
    url: cp.host,
    form: {
      mail: cp.mail,
      passe: cp.password,
      connexion: "1"},
  }, function(err){
    req.cData.connected = err == null;
    next(err ? new FrontendError('UNKNOWN', '/error', err) : null);
  });
};

/* Extract data about a player, supposed that req contains a string param 'playerID' */
var information = function(req, res, next){
  if(!req.cData.connected) return next(new FrontendError('UNKNOWN', '/error'));
  zombie.get({
    url:  cp.host,
    qs: {
      page: "ficheMembre",
      mec: req.body.username},
    }, function(err, response, body){
      if(err) return next(new FrontendError('UNKNOWN', '/error', err));

      var $ = cheerio.load(body);
      /* Extraire l'identifiant du joueur */ 
      var id = $('a[href^="/index.php?page=ficheMembre"]')
        .attr('href')
        .match(/=([0-9]+)$/);

      /* Extract avatar and id */
      req.cData.information = {};
      req.cData.information.id = id && +id[1];
      req.cData.information.avatar = $('.avatarimage').children('img').attr('src');

      next();
    });
};

/* Check for a particular email in the mailbox */
var checkMails = function(req, res, next){
  if(!req.cData.connected || !req.session.verificationKey) return next(new FrontendError('UNKNOWN', '/error'));
  zombie.post({
    url: cp.host + "/index.php?page=messagerie&box=received",
    form: {
      //'rech[BOURRIN]': "1", //Force only new mails
      'rech[RECHGARS]': req.body.username}
    }, function(err, response, body){
      if(err) return next(new FrontendError('UNKNOWN', '/error', err));
      req.cData.keyFound = body.match(new RegExp(req.session.verificationKey)) != null;
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

    /* Once we have a fight, no error should happends now */
    var fight = {
      players: {
        left: $('.fleft > h3').first().text(),
        right: $('.fright > h3').first().text()
      },
      characters: {
        left: {
          avatar: $('.fleft .iconeperso').first().attr('src'),
          name: $('#resultats td > em').first().text().split(' Niveau ')[0].trim(),
          level: +$('#resultats td > em').first().text().split(' Niveau ')[1]

        },
        right: {
          avatar: $('.fright .iconeperso').first().attr('src'),
          name: $('#resultats td[align="right"] > em').first().text().split(' Niveau ')[0].trim(),
          level: +$('#resultats td[align="right"] > em').first().text().split(' Niveau ')[1]
        }
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