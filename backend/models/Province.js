// Province.js — Nepal's 7 provinces (reference / seed data)

const mongoose = require('mongoose');

const provinceSchema = new mongoose.Schema(
  {
    provinceName: {
      type:     String,
      required: true,
      unique:   true,
      trim:     true,
    },
    provinceCode: {
      type:   String,
      unique: true,
      trim:   true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Province', provinceSchema);