var router = require('express').Router();
var cUtils = require('../../middlewares/controllersUtils');
var zombie = require('../../middlewares/zombie');
var controllers = require('../../controllers');

/* Do validation on params */
router.param('id', cUtils.ensureParams.id('/match/home'));

/* Routing on /match/... */
router.get('/home', controllers.match.home);

router.get('/:id/show', controllers.match.show);

router.post('/:id/register', 
  zombie.connect, 
  zombie.information, 
  controllers.match.register
);

router.post('/:id/confirm', 
  zombie.connect, 
  zombie.checkMails, 
  controllers.match.confirm
);

router.post('/:id/validate',
  zombie.parseFight, 
  controllers.match.validate
);

module.exports = router;

