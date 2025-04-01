/*
This file contains restaurant-related routes including listing, viewing, updating, and deleting restaurants
*/

const express = require('express');
const router = express.Router();
const path = require('path');
const { Restaurant, Review } = require('../Models/lasappDB');

// Get all restaurants (homepage)
  router.get('/', async (req, res) => {
    try {
      const restaurants = await Restaurant.find({isAlive: true});
      
      // Fix image paths for all restaurants to use absolute paths
      const formattedRestaurants = restaurants.map(resto => {
        const restaurant = resto.toObject();
        // Check if image path starts with './' and convert to absolute path
        if (restaurant.resto_img && restaurant.resto_img.startsWith('./')) {
          restaurant.resto_img = '/' + restaurant.resto_img.substring(2);
        }
        return restaurant;
      });
      
      console.log("Successfully found restaurants:", formattedRestaurants);
      res.render('LaSapp', { restaurants: formattedRestaurants });
    } catch (err) {
      console.error('Error fetching restaurants:', err);
      res.status(500).send('Server Error');
    }
  });

// Get single restaurant by ID
router.get('/:id', async (req, res) => {
  try {
    const restaurantId = parseInt(req.params.id, 10);
    console.log(`Restaurant ID: ${restaurantId}`);
    
    const restaurant = await Restaurant.findOne({resto_id: restaurantId, isAlive: true});
    if (!restaurant) {
      return res.status(404).send('Restaurant not found');
    } else {
      console.log("Successfully found restaurant");
    }
    
    // Get the reviews for the restaurant with populated account data
    var reviews = await Review.find({resto_id: restaurantId, isAlive: true})
      .populate({
        path: 'account_id',
        localField: 'account_id',
        foreignField: 'acc_id',
        model: 'Account',
        match: { isAlive: true }
      })
      .exec();
    
    console.log('Reviews with populated accounts:', reviews.map(r => ({
      id: r.review_id,
      accountId: r.account_id ? r.account_id.acc_id : 'None',
      accountName: r.account_id ? r.account_id.acc_name : 'Anonymous'
    })));
    
    if(!reviews) {
      console.log("No reviews found");
    } else {
      console.log(`Found ${reviews.length} reviews`);
    }
    
    // Convert relative image path to absolute path
    let imagePath = restaurant.resto_img;
    if (imagePath && imagePath.startsWith('./')) {
      imagePath = '/' + imagePath.substring(2);
    }
    
    // Render restaurant page
    res.render('restaurant', {
      restaurant: {
        id: restaurant.resto_id,
        name: restaurant.resto_name,
        location: restaurant.resto_address,
        image: imagePath, // Use the corrected path
        address: restaurant.resto_address,
        time: restaurant.resto_time,
        phone: restaurant.resto_phone,
        email: restaurant.resto_email,
        payment: restaurant.resto_payment,
        perks: restaurant.resto_perks.split(', '),
        cuisine: restaurant.cuisine_id 
      },
      reviews: reviews
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Add new restaurant
router.post('/create-resto', async (req, res) => {
  try {
    console.log("Received restaurant submission");
    // Find highest existing resto_id
    const highestRestaurant = await Restaurant.findOne().sort('-resto_id');
    const newRestoId = highestRestaurant ? highestRestaurant.resto_id + 1 : 1;
    
    // Default image path - use absolute path
    let imagePath = '/Views/images/restaurantPictures/default-restaurant.png';
    
    if (req.files && req.files.image) {
      const image = req.files.image;
      const fileName = `restaurant_${newRestoId}_${Date.now()}${path.extname(image.name)}`;
      
      // Create destination path
      const filePath = path.join(__dirname, '../Views/images/restaurantPictures', fileName);
      
      try {
        // Move the uploaded file to the destination
        await image.mv(filePath);
        
        // Set the image path as absolute path for the new restaurant
        imagePath = `/Views/images/restaurantPictures/${fileName}`;
        console.log("Image path set to:", imagePath);
        
      } catch (imageError) {
        console.error("Error processing image:", imageError);
        // Continue with default image if upload fails
      }
    }
    
    const newRestaurant = new Restaurant({
      resto_id: newRestoId,
      resto_name: req.body.name || '',
      resto_address: req.body.address || '',
      resto_time: req.body.time || '',
      resto_phone: req.body.phoneNumber || '',
      resto_email: req.body.email || '',
      resto_payment: req.body.payment || '',
      resto_perks: req.body.perks || 'None',
      cuisine_id: req.body.cuisine_id || '',
      resto_img: imagePath,
      resto_owner_id: 0 ,
      isAlive: true  // Add this line
    });
    
    await newRestaurant.save();
    res.status(201).json({
      success: true,
      message: 'Restaurant added successfully',
      resto_id: newRestoId
    });
  } catch (error) {
    console.log("Error in restaurant submission:");
    console.error('Error adding restaurant:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add restaurant',
      error: error.message
    });
  }
});

// Update restaurant
router.put('/api/submitupdate', async (req, res) => {
  try {
    console.log("Received Update Request:", req.body);
    
    // Check if resto_id is provided
    if (!req.body.resto_id) {
      return res.status(400).json({ success: false, message: "resto_id is required" });
    }
    
    const restaurantId = parseInt(req.body.resto_id, 10);
    
    // Create properly mapped update object that matches your schema
    const updateData = {
      resto_name: req.body.name,
      resto_address: req.body.address,
      resto_time: req.body.time,
      resto_phone: req.body.phoneNumber,
      resto_email: req.body.email,
      resto_payment: req.body.payment,
      resto_perks: req.body.perks,
      resto_cuisine: req.body.cuisine,
    };
    
    // Handle image upload if present
    if (req.files && req.files.image) {
      const image = req.files.image;
      const fileName = `restaurant_${restaurantId}_${Date.now()}${path.extname(image.name)}`;
      
      // Create destination path
      const filePath = path.join(__dirname, '../Views/images/restaurantPictures', fileName);
      
      try {
        await image.mv(filePath);
        
        // Set the image path for database update using absolute path
        updateData.resto_img = `/Views/images/restaurantPictures/${fileName}`;
        console.log("Image updated to:", updateData.resto_img);
        
      } catch (imageError) {
        console.error("Error processing image:", imageError);
        // Continue with update even if image processing fails
      }
    }
    
    console.log("Mapped update data:", updateData);
    
    const restaurant = await Restaurant.findOneAndUpdate(
      { resto_id: restaurantId },
      { $set: updateData },
      { new: true }
    );
    
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }
    
    res.status(200).json({
      success: true,
      message: 'Restaurant updated successfully',
      restaurant,
      resto_id: restaurantId
    });
  } catch (error) {
    console.error('Error updating restaurant:', error);
    res.status(500).json({ success: false, message: 'Failed to update restaurant', error: error.message });
  }
});

// Delete (archive) restaurant
router.delete('/:id', async (req, res) => {
  try {
    const restaurantId = parseInt(req.params.id, 10);
    
    if (isNaN(restaurantId)) {
      return res.status(400).json({ success: false, message: 'Invalid restaurant ID' });
    }
    
    // Soft delete by setting isAlive to false
    const restaurant = await Restaurant.findOneAndUpdate(
      { resto_id: restaurantId },
      { isAlive: false },
      { new: true }
    );
    
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }
    
    res.status(200).json({ 
      success: true, 
      message: 'Restaurant deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting restaurant:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete restaurant', 
      error: error.message 
    });
  }
});

module.exports = router;