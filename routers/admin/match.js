var router = require('express').Router();
var controllers = require('../../controllers');
var cUtils = require('../../middlewares/controllersUtils');

/* Routing about /admin/match/...*/
router.get('/new', controllers.admin.match.new);
router.post('/new', cUtils.parseDate, controllers.admin.match.create);
router.get('/:id/edit', controllers.admin.match.edit);
router.post('/:id/edit', cUtils.parseDate, controllers.admin.match.update);
router.get('/:id/show', controllers.admin.match.show);
router.post('/:id/delete', controllers.admin.match.delete);

module.exports = router;