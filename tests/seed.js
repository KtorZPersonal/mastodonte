var User = require('../models/User');
var Match = require('../models/Match');

module.exports = function(){
  User.create({
    username: "ZellDintch",
    type: User.TYPES.PLAYER,
    id2f: 407898,
    avatar: "/upload/1404031783.png",
    verifiedEvent: [],
  }, function(err, user){
    console.log(user);
  });

  User.create({
    username: "Snow.D. Ice",
    type: User.TYPES.PLAYER,
    id2f: 434,
    avatar: "/upload/1340826055.jpg",
    verifiedEvent: [],
  }, function(err, user){
    console.log(user);
  });

  User.create({
    username: "Shenron",
    password: "doesntmatter",
    type: User.TYPES.MODERATOR,
    id2f: 0,
    avatar: "noAvat",
    verifiedEvent: [],
  }, function(err, user){
    console.log(user);
  });

  Match.create({
    name: "Christmas Cup",
    beginning: new Date('2014-12-24 10:00'),
    fights: [],
    players: [0, 1],
    nbFights: 75
  }, function(err, match){
    console.log(match);
  });

  Match.create({
    name: "Easter Tournament",
    beginning: new Date('2015-04-01 14:00'),
    fights: [],
    players: [],
    nbFights: 2500
  }, function(err, match){
    console.log(match);
  });
};