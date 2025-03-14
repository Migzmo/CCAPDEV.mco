//For Initializing mongoose
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/lasappDB')
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.log(err));

//For Initializing express
const express = require('express');
const path = require('path');
const app = express();

// Initialize our Reviews
const { Account, Cuisine, Restaurant, Review } = require("./database/models/lasappDB");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(__dirname));

var hbs = require('hbs')
app.set('view engine','hbs');

// Serve the list of restaurants as JSON

// Dynamic route to serve restaurant pages
/*
const restoList = [
    { id: 1, name: "El Poco", file: "RestoElPoco.html" },
    { id: 2, name: "Jollibee", file: "RestoJollibee.html" },
    { id: 3, name: "Mang Inasal", file: "RestoMangInasal.html" },
    { id: 4, name: "McDonald's", file: "Restomcdowebp.html" },
    { id: 5, name: "Pho Mahal", file: "RestoPhoMahal.html" }
];
app.get('/restaurant_pages', function (req, res) {
    res.json(restoList);
});

app.get("/restaurant/:file", (req, res) => {
    const fileName = req.params.file;
    const filePath = path.join(__dirname, "html", fileName);
  
    res.sendFile(filePath, (err) => {
      if (err) {
        res.status(404).send("Restaurant page not found.");
      }
    });
});*/

// Render restaurant page using Handlebars
app.get('/restaurant/:id', async function (req, res) {
  try {
      const restaurantId = parseInt(req.params.id, 10); // Convert the ID to an integer
      console.log(`Restaurant ID: ${restaurantId}`); // Print the ID to the console
      const restaurant = await Restaurant.findOne({id: restaurantId }).populate('cuisine_id resto_owner_id');
      if (!restaurant) {
          return res.status(404).send('Restaurant not found');
      }else{
          console.log("Sucessfully found restaurant");
      }
      res.render('RestoElPoco', {
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
      });
  } catch (err) {
      console.error(err); // Log the error details to the console
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