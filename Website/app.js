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
const fileUpload = require('express-fileupload')
const path = require('path');
const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, 'public')));

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
        const accountData = JSON.parse(fs.readFileSync('accounts.json', 'utf8'));
        await Account.deleteMany({});
        await Account.insertMany(accountData);
        console.log('Account data imported successfully');
        
      }else{
        impErr1= true;
      }
      
      // Import Cuisines
      if (fs.existsSync('cuisines.json')) {
        const cuisineData = JSON.parse(fs.readFileSync('cuisines.json', 'utf8'));
        await Cuisine.deleteMany({});
        await Cuisine.insertMany(cuisineData);
        console.log('Cuisine data imported successfully');
      }else{
        impErr2= true;
      }
      
      // Import Restaurants
      if (fs.existsSync('restaurants.json')) {
        const restaurantData = JSON.parse(fs.readFileSync('restaurants.json', 'utf8'));
        await Restaurant.deleteMany({});
        await Restaurant.insertMany(restaurantData);
        console.log('Restaurant data imported successfully');
      }else{
        impErr3= true;
      }
      
      // Import Reviews
      if (fs.existsSync('reviews.json')) {
        const reviewData = JSON.parse(fs.readFileSync('reviews.json', 'utf8'));
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

//auth routes
app.post('/api/auth/register', async (req, res) => {
    try {
        console.log('Register route accessed', req.body);
        // Generate unique account ID
        const lastAccount = await Account.findOne().sort({ acc_id: -1 });
        const newAccId = lastAccount ? lastAccount.acc_id + 1 : 1;

        // Create new account
        const newAccount = new Account({
            acc_id: newAccId,
            acc_name: req.body.username,
            acc_username: req.body.username,
            acc_bio: req.body.description || '',
            profile_pic: req.body.profilePic || '',
            saved_restos: [],
            saved_reviews: []
        });

        await newAccount.save();
        res.status(201).json({
            success: true,
            message: 'Account created successfully'
        });
    } catch (error) {
        console.error('Registration error:', error);
        // Handle duplicate username error
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Username already exists'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error creating account',
            error: error.message
        });
    }
});

// Your existing routes for restaurant and profile pages
// ...

// Initialize our Reviews
const { Account, Cuisine, Restaurant, Review } = require("./database/models/lasappDB");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(__dirname));

var hbs = require('hbs')
app.set('view engine','hbs');

/****************************************************************************************************************************************************************************/
//This Section is responsible for routing and rendering the pages


// Render restaurant page using Handlebars
app.get('/restaurant/:id', async function (req, res) {
  try {
      const restaurantId = parseInt(req.params.id, 10); // Convert the ID to an integer //10 might cause issue check later
      console.log(`Restaurant ID: ${restaurantId}`); // Print the ID to the console
      const restaurant = await Restaurant.findOne({resto_id: restaurantId });
      if (!restaurant) {
          return res.status(404).send('Restaurant not found');
      }else{
          console.log("Sucessfully found restaurant");
      }
      //this will get the reviews for the restaurant and also populate the account_id field with user data
      var reviews = await Review.find({resto_id: restaurantId}).populate({
        path: 'account_id',
        localField: 'account_id',
        foreignField: 'acc_id',
        model: 'Account'}).exec();
      if(!reviews){
          console.log("No reviews found");
      }else{
        console.log(`Found ${reviews.length} reviews`);
      }
      //This will render restaurant handlbar 
      res.render('restaurant', {
          restaurant: {
              name: restaurant.resto_name,
              location: restaurant.resto_address,
              image: restaurant.resto_img,
              address: restaurant.resto_address,
              time: restaurant.resto_time,
              phone: restaurant.resto_phone,
              email: restaurant.resto_email,
              payment: restaurant.resto_payment,
              perks: restaurant.resto_perks.split(', ')
          },
          reviews:reviews
      });
  } catch (err) {
      console.error(err); // Log the error details to the console
      res.status(500).send('Server Error');
  }
});


//render profile page using handlebars this will fetch data in mongo db 
app.get('/profile/:id', async function (req, res) {
    try{
        const accountId = parseInt(req.params.id, 10);
        console.log(`Account ID: ${accountId}`);
        const account = await Account.findOne({acc_id: accountId});
        if(!account){
            return res.status(404).send('Account not found');
    }else{
        console.log("Sucessfully found account");
        
    }
    res.render('Profile', {
        account: {
            name: account.acc_name,
            username: account.acc_username,
            bio: account.acc_bio,
            image: account.profile_pic
        },
    });
    }catch(err){
        console.error(err);
        res.status(500).send('Server Error');
    }
});


app.post('/', async (req, res) => {
  try {
      console.log("Received restaurant data:", req.body);
      
      // Find highest existing resto_id
      const highestRestaurant = await Restaurant.findOne().sort('-resto_id');
      const newRestoId = highestRestaurant ? highestRestaurant.resto_id + 1 : 1;
      
      // Get cuisine ID or create new cuisine
      let cuisineId = 1; // Default cuisine ID
      if (req.body.cuisine_name) {
          const cuisine = await Cuisine.findOne({ cuisine_name: req.body.cuisine_name });
          if (cuisine) {
              cuisineId = cuisine.cuisine_id;
          } else {
              // Create new cuisine if it doesn't exist
              const highestCuisine = await Cuisine.findOne().sort('-cuisine_id');
              const newCuisineId = highestCuisine ? highestCuisine.cuisine_id + 1 : 1;
              
              const newCuisine = new Cuisine({
                  cuisine_id: newCuisineId,
                  cuisine_name: req.body.cuisine_name
              });
              await newCuisine.save();
              cuisineId = newCuisineId;
          }
      }
      let imagePath = '/views/CSS/RestoImages/default-restaurant.jpg'; // Default image
      
      if (req.files && req.files.image) {
          const image = req.files.image;
          const fileName = `restaurant_${newRestoId}_${Date.now()}${path.extname(image.name)}`;
          
          // Move the file to the destination folder
          await image.mv(path.join(imageDir, fileName));
          
          // Set the image path for database storage
          imagePath = `/views/CSS/RestoImages/${fileName}`;
      }
      
      // Create new restaurant with all required fields
      const newRestaurant = new Restaurant({
          resto_id: newRestoId,
          resto_name: req.body.name || '',
          resto_address: req.body.address || '',
          resto_time: req.body.time || '',
          resto_phone: req.body.phoneNumber || '',
          resto_email: req.body.email || '',
          resto_payment: req.body.payment || '',
          resto_perks: req.body.perks || 'None',
          cuisine_id: cuisineId,
          resto_img: req.body.image || '/views/CSS/RestoImages/default-restaurant.jpg',
          resto_owner_id: 0 // Default owner ID
      });
      
      console.log("Saving restaurant:", newRestaurant);
      await newRestaurant.save();
      
      res.status(201).json({
          message: 'Restaurant added successfully',
          resto_id: newRestoId
      });
  } catch (error) {
      console.error('Error adding restaurant:', error);
      res.status(500).json({ 
          message: 'Failed to add restaurant',
          error: error.message
      });
  }
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Server error',
        error: err.message
    });
});

//This blocks access to the database for now idk yet
app.use('/database', function (req, res, next) {
    res.status(403).send('Access denied');
});

// Directs to Lasapp homepage
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'Lasapp.html'));
});

// Start server
app.listen(3000, function () {
    console.log('Node server is running on http://localhost:3000');
});

/****************************************************************************************************************************************************************************/