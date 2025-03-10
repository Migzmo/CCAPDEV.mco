
//For Initializing mongoose
const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/lasappDB')

//For Initializing express
const express = require('express')
const app = new express()

//Initialize our Reviews
const Review = require("./database/models/reviews")
const path = require('path')

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(__dirname));


// // !!! TEMP CODE !!!

const restoList = [
    { id: 1, name: "El Poco", file: "RestoElPoco.html" },
    { id: 2, name: "Jollibee", file: "RestoJollibee.html" },
    { id: 3, name: "Mang Inasal", file: "RestoMangInasal.html" },
    { id: 4, name: "McDonald's", file: "Restomcdowebp.html" },
    { id: 5, name: "Pho Mahal", file: "RestoPhoMahal.html" }
]
app.get('/restaurant_pages', function (req, res) {
    res.json(restoList);
});

// Dynamic route to serve restaurant pages
app.get("/restaurant/:file", (req, res) => {
    const fileName = req.params.file;
    const filePath = path.join(__dirname, "html", fileName);
  
    res.sendFile(filePath, (err) => {
      if (err) {
        res.status(404).send("Restaurant page not found.");
      }
    });
  });
// /// ======================


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