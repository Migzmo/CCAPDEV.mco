/*
This file contains configuration settings and middleware setup for the application
*/

const express = require('express');
const path = require('path');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const hbs = require('hbs');

const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.userId) {
        return next();
    }
    res.redirect('/auth/login');
};

// API authentication middleware (returns JSON instead of redirecting)
const isAuthenticatedApi = (req, res, next) => {
    if (req.session && req.session.userId) {
        return next();
    }
    res.status(401).json({ success: false, message: 'Unauthorized - Please login' });
};

// Make user data available in templates
const populateUserData = (req, res, next) => {
    res.locals.isAuthenticated = !!req.session.userId;
    res.locals.currentUser = req.session.user || null;
    next();
};
//
hbs.registerHelper('eq', function(a, b) {
    console.log(`Comparing ${a} and ${b}`);
    return a === b;
});

hbs.registerHelper('and', function() {
    return Array.prototype.slice.call(arguments, 0, -1).every(Boolean);
  });

hbs.registerHelper('toString', function(value) {
  return value ? value.toString() : '';
});

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

// Format time from Date object to readable time string
hbs.registerHelper('formatTime', function(dateTime) {
    if (!dateTime) return '';
    
    const date = new Date(dateTime);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12; // Convert 0 to 12
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    
    return `${hours}:${minutesStr} ${ampm}`;
}); // Fixed closing syntax

hbs.registerHelper('or', function() {
    return Array.prototype.slice.call(arguments, 0, -1).some(Boolean);
  });

// Setup middleware functions
const setupMiddleware = (app) => {
    // Basic Express middleware
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ extended: true }));
    
    // Serve static files - order matters for proper resolution
    app.use('/views', express.static(path.join(__dirname, '../views'))); // Serve Views directory directly
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
    app.set('views', path.join(__dirname, '../views'));
    
    // Log that views path is set
    console.log('Views directory set to:', path.join(__dirname, '../views'));
};

// Create directories if they don't exist
const setupDirectories = () => {
    const imagesDir = path.join(__dirname, '../views/images/restaurantPictures');
    if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir, { recursive: true });
    }
    
    const profilesDir = path.join(__dirname, '../views/images/profilePictures');
    if (!fs.existsSync(profilesDir)) { 
        fs.mkdirSync(profilesDir, { recursive: true }); 
    }
};

module.exports = {
    setupMiddleware,
    setupDirectories,
    isAuthenticated,
    isAuthenticatedApi,
    populateUserData
};