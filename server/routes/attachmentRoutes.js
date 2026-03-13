const router = require('express').Router({ mergeParams: true });
const attachmentController = require('../controllers/attachmentController');
const auth = require('../middleware/auth');
const multer = require('multer');

const path = require('path');

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../uploads'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

router.post('/', auth, upload.single('file'), attachmentController.create);
router.get('/:id/download', auth, attachmentController.download);
router.post('/:id/delete', auth, attachmentController.destroy);

module.exports = router;