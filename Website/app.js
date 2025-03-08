
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