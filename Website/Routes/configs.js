/*
This file contains configuration settings and middleware setup for the application
*/

const express = require('express');
const path = require('path');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const hbs = require('hbs');

// Configure Handlebars helpers
hbs.registerHelper('for', function(from, to, options) {
    let result = '';
    const f = parseInt(from);
    const t = parseInt(to);
    
    console.log(`Generating loop from ${f} to ${t}`);
    
    for (let i = f; i < t; i++) {
        if (options.hash && options.hash.includeIndex === false) {
            result += options.fn();
        } else {
            result += options.fn(i);
        }
    }
    return result;
});

// Setup middleware functions
const setupMiddleware = (app) => {
    // Basic Express middleware
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ extended: true }));
    
    // Serve static files - order matters for proper resolution
    app.use('/Views', express.static(path.join(__dirname, '../Views'))); // Serve Views directory directly
    app.use(express.static(path.join(__dirname, '..'))); // Serve from project root
    app.use(express.static(path.join(__dirname, '../public')));
    
    // File upload middleware
    app.use(fileUpload({ 
        limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
        useTempFiles: true,
        tempFileDir: '/tmp/'
    }));
    
    // Set view engine and views directory
    app.set('view engine', 'hbs');
    app.set('views', path.join(__dirname, '../Views'));
    
    // Log that views path is set
    console.log('Views directory set to:', path.join(__dirname, '../Views'));
};

// Create directories if they don't exist
const setupDirectories = () => {
    const imagesDir = path.join(__dirname, '../Views/images/restaurantPictures');
    if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir, { recursive: true });
    }
    
    const profilesDir = path.join(__dirname, '../Views/images/profilePictures');
    if (!fs.existsSync(profilesDir)) { 
        fs.mkdirSync(profilesDir, { recursive: true }); 
    }
};

module.exports = {
    setupMiddleware,
    setupDirectories
};