/*
Developers:
1. Bon Aquino 
2. Adler Strebel
3. Karl Matthew Dela Cruz
4. Jose Miguel Espinosa

last edited: 14/03/2025 
To be done:
di ko alam HAHAHHAHAHA
*/
/****************************************************************************************************************************************************************************/
//This Section is Responsible for initializing the Database and importing the sample data, as well as initializing all needed modules.

//For Initializing mongoose
const mongoose = require('mongoose');
const fs = require('fs');

//For Initializing express
const express = require('express');
const path = require('path');
const app = express();

// Import configuration and middleware setup
const { setupMiddleware, setupDirectories } = require('./Routes/configs');

// Set up directories and middleware
setupDirectories();
setupMiddleware(app);

//For importing sample data to MONGO DB
let impErr1= false;
let impErr2= false;
let impErr3= false;
let impErr4= false;

mongoose.connect('mongodb://localhost/lasappDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Import Accounts
      if (fs.existsSync('accounts.json')) {
        const accountData = JSON.parse(fs.readFileSync('./Models/Accounts/accountsDB-Data.json', 'utf8'));
        await Account.deleteMany({});
        await Account.insertMany(accountData);
        console.log('Account data imported successfully');
        
      }else{
        impErr1= true;
      }
      
      // Import Cuisines
      if (fs.existsSync('cuisines.json')) {
        const cuisineData = JSON.parse(fs.readFileSync('./Models/Cuisines/cuisinesDB-Data.json', 'utf8'));
        await Cuisine.deleteMany({});
        await Cuisine.insertMany(cuisineData);
        console.log('Cuisine data imported successfully');
      }else{
        impErr2= true;
      }
      
      // Import Restaurants
      if (fs.existsSync('restaurants.json')) {
        const restaurantData = JSON.parse(fs.readFileSync('./Models/Restaurants/restaurantsDB-Data.json', 'utf8'));
        await Restaurant.deleteMany({});
        await Restaurant.insertMany(restaurantData);
        console.log('Restaurant data imported successfully');
      }else{
        impErr3= true;
      }
      
      // Import Reviews
      if (fs.existsSync('reviews.json')) {
        const reviewData = JSON.parse(fs.readFileSync('./Models/Reviews/reviewsDB-Data.json', 'utf8'));
        await Review.deleteMany({});
        await Review.insertMany(reviewData);
        console.log('Review data imported successfully');
      }{
        impErr4= true;
      }
      if(impErr1 && impErr2 && impErr3 && impErr4){
        console.log('Missing Data');
      }else{
        console.log('All data imported successfully!');
      }
      
    } catch (err) {
      console.error('Import error:', err);
    } 
  })
  .catch(err => console.error('Connection error:', err));

// Initialize our Models
const { Account, Cuisine, Restaurant, Review } = require("./Models/lasappDB");

// Import Routes
const authRoutes = require('./Routes/authRoutes');
const userRoutes = require('./Routes/userRoutes');
const restaurantRoutes = require('./Routes/restaurantRoutes');
const reviewRoutes = require('./Routes/reviewRoutes');

// Import Error Handlers
const { globalErrorHandler, denyDatabaseAccess } = require('./Routes/errorHandlers');

/****************************************************************************************************************************************************************************/
//This Section is responsible for routing and handling API endpoints

// Basic routes - Fix the order of middleware mounting
app.get('/', (req, res) => {
  res.redirect('/restaurant');
});

// Mount restaurant routes before user routes to avoid path conflicts
app.use('/restaurant', restaurantRoutes);
app.use('/profile', userRoutes); // Mount user routes at /profile prefix

// API routes - Update the path to match the revised API endpoint
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes); // This will use the /api/users prefix for API calls
app.use('/api/restaurant', restaurantRoutes);
app.use('/api/reviews', reviewRoutes);

// Error handling middleware
app.use('/database', denyDatabaseAccess);
app.use(globalErrorHandler);

// Start server
app.listen(3000, function () {
    console.log('Node server is running on http://localhost:3000');
});

console.log('Registered routes:');
app._router.stack.forEach((middleware) => {
  if (middleware.route) {
    // Routes registered directly on the app
    const path = middleware.route.path;
    const methods = Object.keys(middleware.route.methods).join(', ').toUpperCase();
    console.log(`${methods} ${path}`);
  } else if (middleware.name === 'router') {
    // Routes registered using Router
    middleware.handle.stack.forEach((handler) => {
      if (handler.route) {
        const path = handler.route.path;
        const methods = Object.keys(handler.route.methods).join(', ').toUpperCase();
        console.log(`${methods} ${path}`);
      }
    });
  }
});
/****************************************************************************************************************************************************************************/