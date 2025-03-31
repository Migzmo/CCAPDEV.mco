// config/database.js
const mongoose = require('mongoose');
const fs = require('fs');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost/lasappDB', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');
    return mongoose.connection;
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

module.exports = connectDB;