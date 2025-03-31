// Review Schema
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  review_id: { type: Number, unique: true, required: true },
  account_id: { type: Number, ref: 'Account', default: 0 },
  resto_id: { type: Number, ref: 'Restaurant', required: true },
  rating: { type: Number, required: true },
  review: { type: String, required: true },
  isAlive: { type: Boolean, default: true }
});

module.exports = mongoose.model('Review', reviewSchema);