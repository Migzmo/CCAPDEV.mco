/*
This file contains restaurant-related routes including listing, viewing, updating, and deleting restaurants
*/

const express = require('express');
const router = express.Router();
const path = require('path');
const { Restaurant, Review } = require('../Models/lasappDB');
const { isAuthenticated, isAuthenticatedApi } = require('./configs');

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
  
      // Make sure to pass the user type correctly
      const userType = req.session.user?.accountType || null;
      
      console.log("Successfully found restaurants:", formattedRestaurants);
      
      console.log("Session debug for resto:", {
        directUserType: req.session.userType,
        sessionUser: req.session.user,
        userId: req.session.userId
      });
      res.render('LaSapp', { 
        restaurants: formattedRestaurants, 
        user: {
          userId: req.session.userId,
          userType: userType
        }
      });
      
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
    
    // Add empty replies array to each review (this will be populated client-side)
    reviews = reviews.map(review => {
      // Create a formatted date from MongoDB's ObjectId timestamp (creation date)
      const createdDate = new Date(review._id.getTimestamp()).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      // Format the edit date if it exists
      let editedDate = null;
      if (review.last_edited_at) {
        editedDate = new Date(review.last_edited_at).toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      
      // Return review with both dates and edit status
      return {
        ...review.toObject(),
        date: createdDate,
        editedDate: editedDate,
        isEdited: !!review.last_edited_at,
        replies: [] // Add empty replies array
      };
    });
      
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
    const userType =  req.session.user?.accountType || null;
   
    console.log("User type:", userType);
    

    // Render restaurant page
    // In the GET /:id route (around line 50-120)

    console.log("Session debug:", {
      directUserType: req.session.userType,
      sessionUser: req.session.user,
      userId: req.session.userId,
      restaurantOwnerId: restaurant.resto_owner_id
    });

    // Render restaurant page
    res.render('restaurant', {
      restaurant: {
        id: restaurant.resto_id,
        name: restaurant.resto_name,
        location: restaurant.resto_address,
        image: imagePath,
        address: restaurant.resto_address,
        opening_time: restaurant.opening_time,
        closing_time: restaurant.closing_time,
        phone: restaurant.resto_phone,
        email: restaurant.resto_email,
        payment: restaurant.resto_payment,
        perks: restaurant.resto_perks.split(', '),
        cuisine: restaurant.cuisine_id,
        owner_id: Number(restaurant.resto_owner_id)
      },
      reviews: reviews,
      user: {
        userId: Number(req.session.userId), 
        userType: req.session.userType || req.session.user?.accountType
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Add new restaurant
router.post('/create-resto',isAuthenticated, async (req, res) => {
  try {
    console.log("Received restaurant submission");

    // Check if restaurant with same name already exists
    const existingRestaurant = await Restaurant.findOne({ 
      resto_name: req.body.name,
      isAlive: true 
    });
    
    if (existingRestaurant) {
      return res.status(409).json({ 
        success: false, 
        message: 'A restaurant with this name already exists',
        error: 'duplicate_name'
      });
    }
    
    // Find highest existing resto_id
    const highestRestaurant = await Restaurant.findOne().sort('-resto_id');
    const newRestoId = highestRestaurant ? highestRestaurant.resto_id + 1 : 1;
    
    // Default image path - use absolute path
    let imagePath = '/views/images/restaurantPictures/default-restaurant.png';
    
    if (req.files && req.files.image) {
      const image = req.files.image;
      const fileName = `restaurant_${newRestoId}_${Date.now()}${path.extname(image.name)}`;
      
      // Create destination path
      const filePath = path.join(__dirname, '../views/images/restaurantPictures', fileName);
      
      try {
        // Move the uploaded file to the destination
        await image.mv(filePath);
        
        // Set the image path as absolute path for the new restaurant
        imagePath = `/views/images/restaurantPictures/${fileName}`;
        console.log("Image path set to:", imagePath);
        
      } catch (imageError) {
        console.error("Error processing image:", imageError);
        // Continue with default image if upload fails
      }
    }
    
    // Convert time strings to Date objects
    const openingTimeStr = req.body.opening_time; // Format: "HH:MM"
    const closingTimeStr = req.body.closing_time; // Format: "HH:MM"
    
    // Create today's date with the specified times
    const today = new Date();
    const openingDate = new Date(today);
    const [openHours, openMinutes] = openingTimeStr.split(':');
    openingDate.setHours(parseInt(openHours), parseInt(openMinutes), 0, 0);
    
    const closingDate = new Date(today);
    const [closeHours, closeMinutes] = closingTimeStr.split(':');
    closingDate.setHours(parseInt(closeHours), parseInt(closeMinutes), 0, 0);

    const newRestaurant = new Restaurant({
      resto_id: newRestoId,
      resto_name: (req.body.name || '').trim(),
      resto_address: (req.body.address || '').trim(),
      opening_time: openingDate || '',
      closing_time: closingDate || '',
      resto_phone: (req.body.phoneNumber || '').trim(),
      resto_email: (req.body.email || '').trim(),
      resto_payment: (req.body.payment || '').trim(),
      resto_perks: (req.body.perks || 'None').trim(),
      cuisine_id: (req.body.cuisine_id || '').trim(),
      resto_img: imagePath,
      resto_owner_id: req.session.userId,
      isAlive: true
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

    // First find the restaurant to check ownership
    const restaurant = await Restaurant.findOne({ resto_id: restaurantId });
    
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }
    
    // Check if the current user is the owner
    if (restaurant.resto_owner_id !== req.session.userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'You do not have permission to edit this restaurant' 
      });
    }

    // Check for name duplicates only if name was changed
    if (req.body.name && req.body.name !== restaurant.resto_name) {
      const existingRestaurant = await Restaurant.findOne({ 
        resto_name: req.body.name, 
        resto_id: { $ne: restaurantId },
        isAlive: true 
      });
      
      if (existingRestaurant) {
        return res.status(409).json({ 
          success: false, 
          message: 'A restaurant with this name already exists',
          error: 'duplicate_name'
        });
      }
    }

    // Convert time strings to Date objects
    const openingTimeStr = req.body.opening_time;
    const closingTimeStr = req.body.closing_time;
    
    const today = new Date();
    const openingDate = new Date(today);
    const [openHours, openMinutes] = openingTimeStr.split(':');
    openingDate.setHours(parseInt(openHours), parseInt(openMinutes), 0, 0);
    
    const closingDate = new Date(today);
    const [closeHours, closeMinutes] = closingTimeStr.split(':');
    closingDate.setHours(parseInt(closeHours), parseInt(closeMinutes), 0, 0);
    
    // Create properly mapped update object that matches your schema
    const updateData = {
      resto_name: (req.body.name || restaurant.resto_name).trim(),
      resto_address: (req.body.address || restaurant.resto_address).trim(),
      opening_time: openingDate,
      closing_time: closingDate,
      resto_phone: (req.body.phoneNumber || restaurant.resto_phone).trim(),
      resto_email: (req.body.email || restaurant.resto_email).trim(),
      resto_payment: (req.body.payment || restaurant.resto_payment).trim(),
      resto_perks: (req.body.perks || restaurant.resto_perks).trim(),
      cuisine_id: (req.body.cuisine_id || restaurant.cuisine_id).trim()
    };
    
    // Handle image upload if present
    if (req.files && req.files.image) {
      const image = req.files.image;
      const fileName = `restaurant_${restaurantId}_${Date.now()}${path.extname(image.name)}`;
      
      // Create destination path
      const filePath = path.join(__dirname, '../views/images/restaurantPictures', fileName);
      
      try {
        await image.mv(filePath);
        
        // Set the image path for database update using absolute path
        updateData.resto_img = `/views/images/restaurantPictures/${fileName}`;
        console.log("Image updated to:", updateData.resto_img);
        
      } catch (imageError) {
        console.error("Error processing image:", imageError);
        // Continue with update even if image processing fails
      }
    }
    
    // Check if any data has actually changed
    let hasChanges = false;
    
    // Compare each field to see if anything changed
    if (updateData.resto_name !== restaurant.resto_name ||
        updateData.resto_address !== restaurant.resto_address ||
        updateData.resto_phone !== restaurant.resto_phone ||
        updateData.resto_email !== restaurant.resto_email ||
        updateData.resto_payment !== restaurant.resto_payment ||
        updateData.resto_perks !== restaurant.resto_perks ||
        updateData.cuisine_id !== restaurant.cuisine_id ||
        updateData.resto_img) {
      hasChanges = true;
    }
    
    // Special handling for time comparison
    let oldOpenHour = restaurant.opening_time.getHours();
    let oldOpenMinute = restaurant.opening_time.getMinutes();
    let oldCloseHour = restaurant.closing_time.getHours();
    let oldCloseMinute = restaurant.closing_time.getMinutes();
    
    if (parseInt(openHours) !== oldOpenHour || 
        parseInt(openMinutes) !== oldOpenMinute || 
        parseInt(closeHours) !== oldCloseHour || 
        parseInt(closeMinutes) !== oldCloseMinute) {
      hasChanges = true;
    }
    
    if (!hasChanges) {
      // No changes detected, but let's treat this as a success
      return res.status(200).json({
        success: true,
        message: 'no changes detected',
        restaurant,
        resto_id: restaurantId
      });
    }
    
    console.log("Mapped update data:", updateData);
    
    const updatedRestaurant = await Restaurant.findOneAndUpdate(
      { resto_id: restaurantId },
      { $set: updateData },
      { new: true }
    );
    
    if (!updatedRestaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }
    
    res.status(200).json({
      success: true,
      message: 'Restaurant updated successfully',
      restaurant: updatedRestaurant,
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
    
    // First find the restaurant to check ownership
    const restaurantToDelete = await Restaurant.findOne({ resto_id: restaurantId });
    
    if (!restaurantToDelete) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }
    
    // Check if the current user is the owner
    if (restaurantToDelete.resto_owner_id !== req.session.userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'You do not have permission to delete this restaurant' 
      });
    }
    
    // First find all reviews for this restaurant to get their IDs
    const restaurantReviews = await Review.find({ resto_id: restaurantId });
    const reviewIds = restaurantReviews.map(review => review.review_id);
    
    // Archive all reviews for this restaurant
    await Review.updateMany(
      { resto_id: restaurantId },
      { isAlive: false }
    );
    
    // Archive all replies for these reviews
    if (reviewIds.length > 0) {
      const { Reply } = require('../Models/lasappDB');
      await Reply.updateMany(
        { review_id: { $in: reviewIds } },
        { isAlive: false }
      );
    }
    
    // Soft delete by setting isAlive to false
    const updatedRestaurant = await Restaurant.findOneAndUpdate(
      { resto_id: restaurantId },
      { isAlive: false },
      { new: true }
    );
    
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