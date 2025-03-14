const mongoose = require('mongoose');
// Review Schema
const reviewSchema = new mongoose.Schema({
  review_id: { type: Number, unique: true, required: true },
  account_id: { type: Number, ref: 'Account', required: true },
  resto_id: { type: Number, ref: 'Restaurant', required: true },
  rating: { type: Number, required: true },
  review: { type: String, required: true }
});

const Review = mongoose.model('Review', reviewSchema);
// Restaurant Schema
const restaurantSchema = new mongoose.Schema({
  resto_id: { type: Number, unique: true, required: true },
  resto_name: { type: String,unique:true, required: true },
  resto_address: { type: String, required: true }, // Corrected field name
  resto_time: { type: String },
  resto_phone: { type: String },
  resto_email: { type: String },
  resto_payment: { type: String },
  resto_perks: { type: String },
  resto_img: { type: String }, 
  resto_owner_id: { type: Number, ref: 'Account' },
  cuisine_id: { type: Number, ref: 'Cuisine' },
  resto_reviews: [reviewSchema]
});

const Restaurant = mongoose.model('Restaurant', restaurantSchema);
// Account Schema
const accountSchema = new mongoose.Schema({
  acc_id: { type: Number, unique: true, required: true },
  acc_name: { type: String, required: true },
  acc_username: { type: String, unique: true, required: true },
  acc_bio: { type: String },
  saved_restos: [restaurantSchema], 
  saved_reviews:[reviewSchema],
  profile_pic: { type: String } // Image URL
});

const Account = mongoose.model('Account', accountSchema);

// Cuisine Schema
const cuisineSchema = new mongoose.Schema({
  cuisine_id: { type: Number, unique: true, required: true },
  cuisine_name: { type: String, required: true }
});

const Cuisine = mongoose.model('Cuisine', cuisineSchema);





module.exports = { Account, Cuisine, Restaurant, Review };