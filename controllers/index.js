module.exports = {
  home: function(req, res) {
    res.redirect('/match/home');
  }, 
  admin: require('./admin'),
  match: require('./match')
};