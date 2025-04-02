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
//for sessions


const session = require('express-session');
const MongoStore = require('connect-mongo');



// Import configuration and middleware setup
const { 
  setupMiddleware, 
  setupDirectories, 
  isAuthenticated, 
  isAuthenticatedApi,
  populateUserData  // Add this import
} = require('./Routes/configs');

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
const likeRoutes = require('./Routes/likeRoutes');

// Import Error Handlers
const { globalErrorHandler, denyDatabaseAccess } = require('./Routes/errorHandlers');

/****************************************************************************************************************************************************************************/
//This Section is responsible for routing and handling API endpoints

// Basic routes - Fix the order of middleware mounting
app.get('/', (req, res) => {
  res.redirect('/restaurant');
});
app.use(session({
  secret: 'lasapp_key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: 'mongodb://localhost/lasappDB',
    collection: 'sessions'
  }),
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 1 day for session expiry
  }
}));
// Mount restaurant routes before user routes to avoid path conflicts
app.use(populateUserData);
app.use('/auth', authRoutes); // NOT protected by isAuthenticated
app.use('/restaurant', restaurantRoutes);

app.use('/profile', isAuthenticated, userRoutes); // Mount user routes at /profile prefix

// Make sure the likes route is registered before the server starts
// Update position to be earlier in the code
app.use('/api/likes', isAuthenticatedApi, likeRoutes);

// 5. API routes
app.use('/api/auth', authRoutes);
app.use('/api/likes', isAuthenticatedApi, likeRoutes);
app.use('/api/users', isAuthenticatedApi, userRoutes);
app.use('/api/restaurant', isAuthenticatedApi, restaurantRoutes);
app.use('/api/reviews', isAuthenticatedApi, reviewRoutes);

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
// Add a restaurant to saved_restos

app.post('/api/restaurants/like', async (req, res) => {
  try {
    const { userId, restoId } = req.body;

    if (!userId || !restoId) {
      return res.status(400).json({ success: false, message: 'User ID and Restaurant ID are required' });
    }

    const account = await Account.findOne({ acc_id: userId });

    if (!account) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!account.saved_restos.includes(restoId)) {
      account.saved_restos.push(restoId);
      await account.save();
    }

    res.status(200).json({ success: true, message: 'Restaurant liked and saved' });
  } catch (error) {
    console.error('Error liking restaurant:', error);
    res.status(500).json({ success: false, message: 'Failed to like restaurant', error: error.message });
  }
});

// Remove a restaurant from saved_restos
app.post('/api/restaurants/unlike', async (req, res) => {
  try {
    const { userId, restoId } = req.body;

    if (!userId || !restoId) {
      return res.status(400).json({ success: false, message: 'User ID and Restaurant ID are required' });
    }

    const account = await Account.findOne({ acc_id: userId });

    if (!account) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Convert to string for comparison if they're not already strings
    account.saved_restos = account.saved_restos.filter(id => String(id) !== String(restoId));
    await account.save();

    res.status(200).json({ success: true, message: 'Restaurant unliked and removed from saved' });
  } catch (error) {
    console.error('Error unliking restaurant:', error);
    res.status(500).json({ success: false, message: 'Failed to unlike restaurant', error: error.message });
  }
});