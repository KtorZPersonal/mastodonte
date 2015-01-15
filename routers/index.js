var router = require('express').Router();
var controllers = require('../controllers');
var cUtils = require('../middlewares/controllersUtils');

/* Include all routes of the app */
router.use(cUtils.init);
router.use('/admin', require('./admin'));
router.use('/match', require('./match'));

/* Routing on / */
router.get('/', controllers.home);
router.get('/error', controllers.error);

/* Export as a middleware to be use in the app */
module.exports = router;