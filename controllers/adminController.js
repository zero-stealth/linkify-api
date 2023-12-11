const Admin = require("../models/Admin");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
    console.log(file);
  },
  fi: function (req, file, cb) {
    cb(null, file.origin);
  },
});

const upload = multer({ storage });

cloudinary.config({
  cloud_name: process.env.CLOUDNAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const handleImageUpload = async (imageFile) => {
  try {
    const result = await cloudinary.uploader.upload(imageFile.path, {
      width: 500,
      height: 500,
      crop: "scale",
    });
    return result.secure_url;
  } catch (error) {
    console.error(error);
    throw new Error("Error uploading image");
  }
};

const creategroupLink = async (req, res) => {
  const {
    title, description, link, country
  } = req.body;

  const logo = req.file; 

  if (!logo) {
    res.status(400).json({ error: "All image required" });
    return;
  }

  try {
    const logoUrl = await handleImageUpload(logo);
    const groupLink = await Admin.create({
      title,
      country,
      description,
      link,
      logo: logoUrl,
    });

    res.status(201).json({
      _id: groupLink._id,
      title: groupLink.title,
      country: groupLink.country,
      description: groupLink.description,
      link: groupLink.link,
      logo: groupLink.logo,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred when creating the group link" });
  }
};


const updategroupLink = async (req, res) => {
  const groupLink = await Admin.findById(req.params.id);

  if (!groupLink) {
    return res
      .status(404)
      .json({ message: " group link does not exist" });
  } else {
    const {
      title, description, link, country
    } = req.body;

    try {
      let logo = groupLink.logo;

      if (req.file) {
        const result = await cloudinary.uploader.upload(
          req.file.path,
          {
            crop: "scale",
          }
        );
        logo = result.secure_url;
      }

      const updatedgroupLink = await Admin.findByIdAndUpdate(
        req.params.id,
        {
          title, description,  link, country
        },
        { new: true }
      );

      res.status(200).json(updatedgroupLink);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "An error occurred while updating  group link" });
    }
  }
};


const getgroupLinks = async (req, res) => {
  try {
    const groupLinks = await Admin.find();

    if (groupLinks.length === 0) {
      return res.status(404).json({ message: "No group links found" });
    } else {
      res.status(200).json(groupLinks);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred while fetching group links" });
  }
};

const getgroupLink = async (req, res) => {
  try {
    const groupLink = await Admin.findById(req.params.id);
    if (!groupLink) {
      return res.status(404).json({ message: "This  group link does not exist" });
    } else {
      res.status(200).json(groupLink);
    }
  } catch (err) {
    console.log(err);
  }
};


const getgroupLinkCountry = async (req, res) => {
  const groupLinks = await Admin.find({
    country: decodeURIComponent(req.params.value),
  });
  if (!groupLinks) {
    return res.status(404).json({ message: " group link does not exist" });
  } else {
    res.status(200).json(groupLinks);
  }
};


const deletegroupLink = async (req, res) => {
  try {
    const groupLink = await Admin.findById(req.params.id);
    if (!groupLink) {
      return res.status(404).json({ message: " group link not found" });
    }
    await Admin.findByIdAndDelete(req.params.id);
    res.status(200).json({ id: req.params.id, message: " group link deleted" });
    return;
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  creategroupLink,
  updategroupLink,
  getgroupLink,
  getgroupLinks,
  getgroupLinkCountry,
  deletegroupLink,
};