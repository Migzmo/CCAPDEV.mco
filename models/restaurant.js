// models/restaurant.js
const mongoose = require('mongoose');

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

module.exports = mongoose.model('Restaurant', restaurantSchema);