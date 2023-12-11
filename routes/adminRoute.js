const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
const {
  getgroupLinkCountry,
  creategroupLink,
  getgroupLink,
  getgroupLinks,
  updategroupLink,
  deletegroupLink,
} = require('../controllers/adminController');

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

router.route('/links')
  .get(getgroupLinks)
  .post(
    protect,
    upload.single('logo'),
    creategroupLink
  );

  router.route('/links/:country')
  .get(getgroupLinkCountry)

router.route('/links/:id')
  .get(getgroupLink)
  .put(
    protect,
    upload.single('logo'),
    updategroupLink
  )
  .delete(protect, deletegroupLink);


module.exports = router;
