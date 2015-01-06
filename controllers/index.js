var router = require('express').Router();

/* Include all routes about the admin section */
router.use('/admin', require('./admin'));

/* Export as a middleware to be use in the app */
module.exports = router;