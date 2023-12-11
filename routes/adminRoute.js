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
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
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
