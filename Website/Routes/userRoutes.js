/*
This file contains user-related routes including profile management and user data
*/

const express = require('express');
const router = express.Router();
const path = require('path');
const { Account, Review, Restaurant } = require('../Models/lasappDB');

// API route handler for retrieving user data
// Important: This route must come before the HTML route handler
router.get('/api/:id', async (req, res) => {
  try {
    console.log(`API request for user ${req.params.id}`);
    
    // Validate that id is a number
    if (!req.params.id || req.params.id === 'undefined' || req.params.id === 'null') {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }
    
    const userId = parseInt(req.params.id, 10);
    
    // Check that the parsed userId is a valid number
    if (isNaN(userId)) {
      console.log(`Invalid user ID format: "${req.params.id}"`);
      return res.status(400).json({ success: false, message: 'Invalid user ID format' });
    }
    
    const account = await Account.findOne({ acc_id: userId });
    
    if (!account) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Set appropriate content type
    res.setHeader('Content-Type', 'application/json');
    
    // Return user data
    res.json({
      acc_id: account.acc_id,
      acc_name: account.acc_name,
      acc_username: account.acc_username,
      acc_bio: account.acc_bio,
      profile_pic: account.profile_pic,
      acc_type: account.acc_type
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Render profile page (HTML route)
router.get('/:id', async function (req, res) {
  try {
    // Check if id is numeric before parsing
    if (!/^\d+$/.test(req.params.id)) {
      console.log(`Invalid profile ID format: "${req.params.id}"`);
      return res.status(400).send('Invalid account ID: Must be a number');
    }
    
    const accountId = parseInt(req.params.id, 10);
    console.log(`Account ID: ${accountId}`);
    
    // Get the current user ID from the query string if available
    const currentUserId = req.query.currentUser ? parseInt(req.query.currentUser) : null;
    
    // Find the account
    const account = await Account.findOne({acc_id: accountId, isAlive: true});
    if(!account){
      return res.status(404).send('Account not found');
    }
    
    // Fetch user's reviews
    const userReviews = await Review.find({
      account_id: accountId, 
      isAlive: true
    }).populate({
      path: 'resto_id',
      localField: 'resto_id',    
      foreignField: 'resto_id',  
      model: 'Restaurant'
    }).exec();
    
    console.log(`Found ${userReviews.length} reviews for user ${accountId}`);
    
    // Format reviews for the template
    const formattedReviews = userReviews.map(review => ({
      id: review.review_id,
      restaurantName: review.resto_id.resto_name,
      restaurantId: review.resto_id.resto_id,
      rating: review.rating,
      review: review.review,
      date: new Date(review._id.getTimestamp()).toLocaleDateString()
    }));
    
    // Determine if this is the user's own profile
    const isOwnProfile = currentUserId === accountId;
    
    // Adding debug output
    console.log("Rendering profile page with:", {
      accountDetails: {
        name: account.acc_name,
        username: account.acc_username,
        bio: account.acc_bio,
        profilePic: account.profile_pic
      },
      isOwnProfile: isOwnProfile,
      reviewsCount: formattedReviews.length
    });
    
    // Render the profile page
    res.render('profile', {
      account: {
        id: account.acc_id,
        name: account.acc_name,
        username: account.acc_username,
        bio: account.acc_bio,
        // Use absolute path for profile pic to avoid relative path issues
        profile_pic: account.profile_pic || '/Views/images/profilePictures/default-profile.png'
      },
      isOwnProfile: isOwnProfile,
      reviews: formattedReviews
    });
  } catch(err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Delete (deactivate) account
router.post('/delete-account', async (req, res) => {
  try {
    console.log('Delete account request received:', req.body);
    userId = req.body.userId;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    // Make sure userId is an integer
    const parsedUserId = parseInt(userId, 10);
    if (isNaN(parsedUserId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }
    
    const account = await Account.findOne({ acc_id: parsedUserId });
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }
    
    // Update account status
    account.isAlive = false;
    await account.save();
    
    // Set content type explicitly
    res.setHeader('Content-Type', 'application/json');
    
    // Return proper JSON response
    return res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Account deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting account',
      error: error.message
    });
  }
});

// Update user profile
router.post('/update-profile', async (req, res) => {
  try {
    console.log('Update profile request received:', req.body);
    const userId = req.body.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Find the account to update
    const account = await Account.findOne({ acc_id: parseInt(userId) });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }

    // Update account fields
    if (req.body.username) account.acc_name = req.body.username;
    if (req.body.username) account.acc_username = req.body.username; // Update both name fields
    if (req.body.bio) account.acc_bio = req.body.bio;

    // Update password if provided
    if (req.body.password && req.body.password.trim() !== '') {
      account.acc_password = req.body.password;
    }
    
    // Handle profile picture upload
    if (req.files && req.files.profile_pic) {
      const profilePic = req.files.profile_pic;
      const fileName = `profile_${userId}_${Date.now()}${path.extname(profilePic.name)}`;
      const uploadPath = path.join(__dirname, '../Views/images/profilePictures', fileName);
      
      await profilePic.mv(uploadPath);
      account.profile_pic = `/Views/images/profilePictures/${fileName}`;
    }

    // Save the updated account
    await account.save();

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
});

module.exports = router;