const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
const {
  creategroupLink,
  updategroupLink,
  getgroupLink,
  getgroupLinks,
  getgroupLinkCountry,
  deletegroupLink,
} = require('../controllers/adminController');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'uploads/';
    require('fs').mkdir(uploadPath, { recursive: true }, (err) => cb(err, uploadPath));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

router.route('/links')
  .get(getgroupLinks)
  .post(
    protect,
    upload.single('logo'),
    creategroupLink
  );

router.route('/links/:country')
  .get(getgroupLinkCountry);

router.route('/links/:id')
  .get(getgroupLink)
  .put(
    protect,
    upload.single('logo'),
    updategroupLink
  )
  .delete(protect, deletegroupLink);

module.exports = router;
