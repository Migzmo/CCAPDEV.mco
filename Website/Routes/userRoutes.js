/*
This file contains user-related routes including profile management and user data
*/

const express = require('express');
const router = express.Router();
const path = require('path');
const bcrypt = require('bcrypt');
const { Account, Review, Restaurant, Reply } = require('../Models/lasappDB');

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
    
    // Get user information from session if available
    const currentUserId = req.session.user ? req.session.user.userId : null;
    const isLoggedIn = !!currentUserId;
    
    // Find the account
    const account = await Account.findOne({acc_id: accountId, isAlive: true});
    if(!account){
      return res.status(404).send('Account not found');
    }
    
    // Fetch user's reviews - this should be viewable by all users
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

    // Fetch user's saved restaurants - only if the user is viewing their own profile
    let savedRestaurants = [];
    const isOwnProfile = isLoggedIn && parseInt(currentUserId, 10) === accountId;
    
    if (account.saved_restos && account.saved_restos.length > 0 && isOwnProfile) {
      savedRestaurants = await Restaurant.find({
        resto_id: { $in: account.saved_restos },
        isAlive: true
      });

      console.log(`Found ${savedRestaurants.length} saved restaurants for user ${accountId}`);
      
      // Format restaurant data for template
      savedRestaurants = savedRestaurants.map(resto => ({
        resto_id: resto.resto_id,
        resto_name: resto.resto_name,
        cuisine_id: resto.cuisine_id,
        image: resto.resto_img || '/views/images/restaurantPictures/default-restaurant.png'
      }));
    }
    
    // Render the profile page
    res.render('profile', {
      account: {
        id: account.acc_id,
        acc_id: account.acc_id,
        name: account.acc_name,
        username: account.acc_username,
        bio: account.acc_bio,
        profile_pic: account.profile_pic || '/views/images/profilePictures/default-profile.png'
      },
      isOwnProfile: isOwnProfile,
      isLoggedIn: isLoggedIn,
      reviews: formattedReviews,
      savedRestaurants: savedRestaurants
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
    
    // Before deactivating account, archive all of the user's content
    
    // Archive user's reviews
    await Review.updateMany(
      { account_id: parsedUserId },
      { isAlive: false }
    );
    
    // Get all reviews to find their IDs (for cascading to replies)
    const userReviews = await Review.find({ account_id: parsedUserId });
    const reviewIds = userReviews.map(review => review.review_id);
    
    // Archive all replies associated with the user's reviews
    if (reviewIds.length > 0) {
      await Reply.updateMany(
        { review_id: { $in: reviewIds } },
        { isAlive: false }
      );
    }
    
    // Archive user's replies (direct replies to other reviews)
    await Reply.updateMany(
      { account_id: parsedUserId },
      { isAlive: false }
    );
    
    // Deactivate the account
    account.isAlive = false;
    await account.save();
    
    // Clear user session if the deleted account is the current user
    if (req.session.userId === parsedUserId) {
      req.session.destroy();
    }
    
    res.status(200).json({
      success: true,
      message: 'Account deactivated successfully'
    });
  } catch (error) {
    console.error('Error deactivating account:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate account',
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
      account.acc_password = await bcrypt.hash(req.body.password, 10); // Hash the new password
    }
    
    // Handle profile picture upload
    if (req.files && req.files.profile_pic) {
      const profilePic = req.files.profile_pic;
      const fileName = `profile_${userId}_${Date.now()}${path.extname(profilePic.name)}`;
      const uploadPath = path.join(__dirname, '../views/images/profilePictures', fileName);
      
      await profilePic.mv(uploadPath);
      account.profile_pic = `/views/images/profilePictures/${fileName}`;
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