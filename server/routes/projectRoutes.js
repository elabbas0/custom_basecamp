const router = require('express').Router();
const projectController = require('../controllers/projectController');
const auth = require('../middleware/auth');

router.get('/new', auth, projectController.newProject);
router.post('/', auth, projectController.create);

// Edit routes
router.get('/:id/edit', auth, projectController.edit);
router.post('/:id', auth, projectController.update);

// Show
router.get('/:id', auth, projectController.show);
router.get('/', auth, projectController.index);

// Delete
router.post('/:id/delete', auth, projectController.destroy);

// Members
router.post('/:id/members', auth, projectController.addMember);
router.post('/:id/members/:userId/remove', auth, projectController.removeMember);

module.exports = router;
