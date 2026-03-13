const router = require('express').Router({ mergeParams: true });
const messageController = require('../controllers/messageController');
const auth = require('../middleware/auth');

router.post('/', auth, messageController.create);
router.get('/:id/edit', auth, messageController.edit);
router.post('/:id', auth, messageController.update);
router.post('/:id/delete', auth, messageController.destroy);

module.exports = router;