var router = require('express').Router();
var controllers = require('../controllers');

/* Include all routes of the app */
router.use('/admin', require('./admin'));
router.use('/match', require('./match'));

/* Routing on / */
router.get('/', controllers.home);

/* Export as a middleware to be use in the app */
module.exports = router;