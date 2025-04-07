/*
Developers:
1. Bon Aquino 
2. Adler Strebel
3. Karl Matthew Dela Cruz
4. Jose Miguel Espinosa

last edited: 14/03/2025 
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
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/lasappDB';
//for sessions

const session = require('express-session');
const MongoStore = require('connect-mongo');


//const bcrypt = require('bcryptjs');

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

app.use(express.static('views'));

//For importing sample data to MONGO DB
let impErr1 = false;
let impErr2 = false;
let impErr3 = false;
let impErr4 = false;
require('dotenv').config();

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Initialize our Models early to use them in imports
      const { Account, Restaurant, Review } = require("./Models/lasappDB");
      
      // Check if any accounts exist already
      const accountsCount = await Account.countDocuments({});
      
      // Only import initial account data if the collection is empty
      if (accountsCount === 0) {
        const accountsPath = path.join(__dirname, 'Models/Accounts/accountsDB-Data.json');
        if (fs.existsSync(accountsPath)) {
          const accountData = JSON.parse(fs.readFileSync(accountsPath, 'utf8'));
          await Account.insertMany(accountData);
          console.log('Initial account data imported successfully');
        } else {
          impErr1 = true;
          console.log('Account data file not found at: ' + accountsPath);
        }
      } else {
        console.log(`Database already has ${accountsCount} accounts, skipping import`);
      }
      
      // Check if any restaurants exist already
      const restaurantCount = await Restaurant.countDocuments({});
      if (restaurantCount === 0) {
        const restaurantsPath = path.join(__dirname, 'Models/Restaurants/restaurantsDB-Data.json');
        if (fs.existsSync(restaurantsPath)) {
          const restaurantData = JSON.parse(fs.readFileSync(restaurantsPath, 'utf8'));
          await Restaurant.insertMany(restaurantData);
          console.log('Initial restaurant data imported successfully');
        } else {
          impErr3 = true;
          console.log('Restaurant data file not found at: ' + restaurantsPath);
        }
      } else {
        console.log(`Database already has ${restaurantCount} restaurants, skipping import`);
      }
      
      // Check if any reviews exist already
      const reviewCount = await Review.countDocuments({});
      if (reviewCount === 0) {
        const reviewsPath = path.join(__dirname, 'Models/Reviews/reviewsDB-Data.json');
        if (fs.existsSync(reviewsPath)) {
          const reviewData = JSON.parse(fs.readFileSync(reviewsPath, 'utf8'));
          await Review.insertMany(reviewData);
          console.log('Initial review data imported successfully');
        } else {
          impErr4 = true;
          console.log('Review data file not found at: ' + reviewsPath);
        }
      } else {
        console.log(`Database already has ${reviewCount} reviews, skipping import`);
      }
      
      if (impErr1 && impErr2 && impErr3 && impErr4) {
        console.error('All data files are missing! Database will be empty.');
      } else {
        console.log('Database initialization complete!');
      }
      
    } catch (err) {
      console.error('Import error:', err);
    } 
  })
  .catch(err => console.error('Connection error:', err));


    app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback-secret-for-dev-only',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: MONGODB_URI,
      collection: 'sessions',
      touchAfter: 24 * 3600 // Only update session once per day unless changed
    }),
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 1 day for session expiry
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      sameSite: 'lax', // Helps with CSRF protection
      path: '/' // Ensure cookies work across your entire site
    }
  }));
// Initialize our Models
const { Account, Restaurant, Review } = require("./Models/lasappDB");

// Import Routes
const authRoutes = require('./Routes/authRoutes');
const userRoutes = require('./Routes/userRoutes');
const restaurantRoutes = require('./Routes/restaurantRoutes');
const reviewRoutes = require('./Routes/reviewRoutes');
const likeRoutes = require('./Routes/likeRoutes');
const replyRoutes = require('./Routes/replyRoutes');

// Import Error Handlers
const { globalErrorHandler, denyDatabaseAccess } = require('./Routes/errorHandlers');

/****************************************************************************************************************************************************************************/
//This Section is responsible for routing and handling API endpoints

// Basic routes - Fix the order of middleware mounting

app.get('/', (req, res) => {
  res.redirect('/restaurant');
});


let currentSessionId = null;
app.use((req, res, next) => {
  if (req.session && req.session.userId) {
    currentSessionId = req.session.id;
  }
  next();
});

app.use((req, res, next) => {
  console.log('Session ID:', req.session.id);
  console.log('User ID in session:', req.session.user.userId);
  console.log('Current Session ID:', req.session.user.accountType);
  next();
});
// Mount restaurant routes before user routes to avoid path conflicts
app.use(populateUserData);
app.use('/auth', authRoutes); // NOT protected by isAuthenticated
app.use('/restaurant',restaurantRoutes);

app.use('/profile', userRoutes); // Mount user routes at /profile prefix

// Make sure the likes route is registered before the server starts
// Update position to be earlier in the code
app.use('/api/likes', isAuthenticatedApi, likeRoutes);

// 5. API routes
app.use('/api/auth', authRoutes);
app.use('/api/likes', isAuthenticatedApi, likeRoutes);
app.use('/api/users', isAuthenticatedApi, userRoutes);
app.use('/api/restaurant', isAuthenticatedApi, restaurantRoutes);
app.use('/api/reviews', isAuthenticatedApi, reviewRoutes);
app.use('/api/replies', replyRoutes);

// Error handling middleware
app.use('/database', denyDatabaseAccess);
app.use(globalErrorHandler);

// Start server
app.listen(PORT, function () {
    console.log('Node server is running on ${PORT}'); 
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

//this is for closing server and deleting session

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
module.exports = app;