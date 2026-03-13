const router = require('express').Router({ mergeParams: true });
const threadController = require('../controllers/threadController');
const messageRoutes = require('./messageRoutes');
const auth = require('../middleware/auth');

router.get('/new', auth, threadController.new);
router.post('/', auth, threadController.create);
router.get('/:id', auth, threadController.show);
router.get('/:id/edit', auth, threadController.edit);
router.post('/:id', auth, threadController.update);
router.post('/:id/delete', auth, threadController.destroy);

// Nest messages under threads
router.use('/:threadId/messages', messageRoutes);

module.exports = router;