const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, default: Date.now },
  category: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Notice', noticeSchema);
