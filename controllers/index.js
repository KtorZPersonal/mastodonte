var handlerHelper = require('../helpers/handler');

module.exports = {
  home: function(req, res) {
    res.redirect('/match/home');
  }, 
  error: function(req, res) {
    res.render('public/error', handlerHelper.locals(req));
  },
  admin: require('./admin'),
  match: require('./match')
};