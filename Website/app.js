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


//For importing sample data to MONGO DB
let impErr1= false;
let impErr2= false;
let impErr3= false;
let impErr4= false;

mongoose.connect('mongodb://localhost/lasappDB')
  .then(async () => {
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