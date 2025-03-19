const mongoose = require('mongoose');
// Review Schema
const reviewSchema = new mongoose.Schema({
  review_id: { type: Number, unique: true, required: true },
  account_id: { type: Number, ref: 'Account' ,default:0},
  resto_id: { type: Number, ref: 'Restaurant', required: true },
  rating: { type: Number, required: true },
  review: { type: String, required: true },
  isAlive: { type: Boolean, default: true }
});

const Review = mongoose.model('Review', reviewSchema);
// Restaurant Schema
const restaurantSchema = new mongoose.Schema({
  resto_id: { type: Number, required: true },//im not sure about this being non unique
  resto_name: { type: String,unique:true, required: true },
  resto_address: { type: String, required: true }, // Corrected field name
  resto_time: { type: String },
  resto_phone: { type: String },
  resto_email: { type: String },
  resto_payment: { type: String },
  resto_perks: { type: String },
  resto_img: { type: String }, 
  resto_owner_id: { type: Number, ref: 'Account' },
  cuisine_id: { type: String },
  resto_reviews: [{type:Number,ref: 'Review'}],
  isAlive: { type: Boolean, default: true }
});

const Restaurant = mongoose.model('Restaurant', restaurantSchema);
// Account Schema
const accountSchema = new mongoose.Schema({
  acc_id: { type: Number, unique: true, required: true },
  acc_name: { type: String, required: true },
  acc_username: { type: String, unique: true, required: true },
  acc_bio: { type: String },
  saved_restos: [{ type: Number, ref: 'Restaurant',default: [] }], // Simple array of IDs
  saved_reviews: [{ type: Number, ref: 'Review',default: [] }],
  profile_pic: { type: String }, // Image URL
  isAlive: { type: Boolean, default: true },
  acc_type:{type:String, enum:['admin','user','business-owner'],default:'user'},
  acc_password:{type:String,required:true}
  
});

const Account = mongoose.model('Account', accountSchema);

// Cuisine Schema
const cuisineSchema = new mongoose.Schema({
  cuisine_id: { type: Number, unique: true, required: true },
  cuisine_name: { type: String, required: true },
  isAlive: { type: Boolean, default: true }
});

const Cuisine = mongoose.model('Cuisine', cuisineSchema);

module.exports = { Account, Cuisine, Restaurant, Review };