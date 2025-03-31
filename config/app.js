// config/app.js
const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const hbs = require('hbs');
const fs = require('fs');

const configureApp = require('./config/app');
const connectDB = require('./config/database');
const { importData } = require('./utils/dataImport');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const accountRoutes = require('./routes/accountRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const indexRoutes = require('./routes/indexRoutes');

// Initialize app
const app = configureApp();

const configureApp = () => {
  const app = express();
  
  // Create required directories
  const dirs = [
    path.join(__dirname, '../public/images/restaurants'),
    path.join(__dirname, '../public/images/profiles')
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
  
  // Configure Express
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static(path.join(__dirname, '../')));
  app.use(express.static(path.join(__dirname, '../public')));
  app.use(fileUpload({ 
    limits: { fileSize: 10 * 1024 * 1024 },
    useTempFiles: true,
    tempFileDir: '/tmp/'
  }));
  
  // Setup HBS
  app.set('view engine', 'hbs');
  app.set('views', path.join(__dirname, '../views'));
  
  // Register HBS helpers
  hbs.registerHelper('for', function(from, to, options) {
    let result = '';
    const f = parseInt(from);
    const t = parseInt(to);
    
    for (let i = f; i < t; i++) {
      if (options.hash && options.hash.includeIndex === false) {
        result += options.fn();
      } else {
        result += options.fn(i);
      }
    }
    return result;
  });
  
  return app;
};

module.exports = configureApp;

// Connect to database and import data if needed
connectDB()
  .then(async (connection) => {
    // Import data if needed
    await importData();
    
    // Register routes
    app.use('/', indexRoutes);
    app.use('/', accountRoutes);
    app.use('/', restaurantRoutes);
    app.use('/', reviewRoutes);
    
    // Error handler - should be registered after all routes
    app.use(errorHandler);
    
    // Block access to database
    app.use('/database', function(req, res) {
      res.status(403).send('Access denied');
    });
    
    // Start server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
    
    // Log registered routes for debugging
    console.log('Registered routes:');
    app._router.stack.forEach((middleware) => {
      if (middleware.route) {
        const path = middleware.route.path;
        const methods = Object.keys(middleware.route.methods).join(', ').toUpperCase();
        console.log(`${methods} ${path}`);
      } else if (middleware.name === 'router') {
        middleware.handle.stack.forEach((handler) => {
          if (handler.route) {
            const path = handler.route.path;
            const methods = Object.keys(handler.route.methods).join(', ').toUpperCase();
            console.log(`${methods} ${path}`);
          }
        });
      }
    });
  })
  .catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });