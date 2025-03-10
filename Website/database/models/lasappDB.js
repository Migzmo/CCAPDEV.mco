const mongoose = require('mongoose');

// Account Schema
const accountSchema = new mongoose.Schema({
  acc_id: { type: Number, unique: true, required: true },
  acc_name: { type: String, required: true },
  acc_username: { type: String, unique: true, required: true },
  saved_restos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' }], // Array of references
  profile_pic: { type: String } // Image URL
});

const Account = mongoose.model('Account', accountSchema);

// Cuisine Schema
const cuisineSchema = new mongoose.Schema({
  cuisine_id: { type: Number, unique: true, required: true },
  cuisine_name: { type: String, required: true }
});

const Cuisine = mongoose.model('Cuisine', cuisineSchema);

// Restaurant Schema
const restaurantSchema = new mongoose.Schema({
  resto_id: { type: Number, unique: true, required: true },
  resto_name: { type: String, required: true },
  resto_address: { type: String, required: true }, // Corrected field name
  resto_time: { type: String },
  resto_phone: { type: String },
  resto_email: { type: String },
  resto_payment: { type: String },
  resto_perks: { type: String },
  resto_img: { type: String }, // Image URL
  resto_owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
  cuisine_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Cuisine' }
});

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

// Review Schema
const reviewSchema = new mongoose.Schema({
  review_id: { type: Number, unique: true, required: true },
  account_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
  resto_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  rating: { type: Number, required: true },
  review: { type: String, required: true }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = { Account, Cuisine, Restaurant, Review };