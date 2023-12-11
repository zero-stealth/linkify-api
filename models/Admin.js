const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    link: {
      type: String,
    },
    description: {
      type: String,
    },
    country: {
      type: String,
    },
    logo: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
