// models/account.js
const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  acc_id: { type: Number, unique: true, required: true },
  acc_name: { type: String, required: true },
  acc_username: { type: String, unique: true, required: true },
  acc_bio: { type: String },
  saved_restos: [{ type: Number, ref: 'Restaurant', default: [] }],
  saved_reviews: [{ type: Number, ref: 'Review', default: [] }],
  profile_pic: { type: String, default: '/images/profiles/default-profile.png' },
  isAlive: { type: Boolean, default: true },
  acc_type: { type: String, enum: ['admin', 'user', 'business-owner'], default: 'user' },
  acc_password: { type: String, required: true }
});

module.exports = mongoose.model('Account', accountSchema);