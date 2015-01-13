var router = require('express').Router();
var controllers = require('../../controllers');
var myPassport = require('../../middlewares/passport');

/* Include all routes about the admin section */
router.use('/match', 
  myPassport.ensureAuthenticated, 
  require('./match')
);

/* Routing on /admin/...  */
router.get('/', 
  myPassport.ensureAuthenticated, 
  controllers.admin.home
);

router.get('/logout', 
  myPassport.ensureAuthenticated, 
  controllers.admin.logout
);

router.get('/login', controllers.admin.login);
router.post('/login', controllers.admin.connect);

/* Export as a middleware to be use in the app */
module.exports = router;