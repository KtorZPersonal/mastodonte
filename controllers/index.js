var router = require('express').Router();

/* Include all routes about the admin section */
router.use('/admin', require('./admin'));

router.get('/createUser', function(req, res){
  require('../models/User').create({username: 'Shenron', password: 'xx14xx'}, function(err, user){
    if (err) console.log(err)
    res.redirect('/admin');
  });
});

/* Export as a middleware to be use in the app */
module.exports = router;