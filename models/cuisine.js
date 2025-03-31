// Cuisine Schema
const mongoose = require('mongoose');

const cuisineSchema = new mongoose.Schema({
    cuisine_id: { type: Number, unique: true, required: true },
    cuisine_name: { type: String, required: true },
    isAlive: { type: Boolean, default: true }
  });
  
  module.exports = mongoose.model('Cuisine', cuisineSchema);