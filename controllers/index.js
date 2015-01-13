var router = require('express').Router();
var controllerUtils = require('../middlewares/controllerUtils');

/* Include all routes about the admin section */
router.use('/admin', controllerUtils.init, require('./admin'));
router.use('/match', controllerUtils.init, require('./match'));

router.get('/', function(req, res){
  res.redirect('/match/home')
});

router.get('/createUser', function(req, res){
  require('../models/User').create({username: 'Shenron', password: 'xx14xx', avatar: 'noAvatar', id2f: 0, type: 'moderator'}, function(err, user){
    if (err) console.log(err)
    res.redirect('/admin');
  });
});

/* Export as a middleware to be use in the app */
module.exports = router;