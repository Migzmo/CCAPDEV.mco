/*
This file contains authentication routes including login and registration
*/

const path = require('path');
const bcrypt = require('bcrypt'); 
const express = require('express');
const fs = require('fs');
const router = express.Router();
const { Account } = require('../Models/lasappDB');

// User login route
router.post('/login', async (req, res) => {
  try {
    console.log('Login route accessed', req.body);
    const { username, password } = req.body;
  
    // Find the account by username
    const account = await Account.findOne({ acc_username: username });
  
    if (!account) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }
    
    if (!account.isAlive) {
      return res.status(401).json({
        success: false,
        message: 'This account has been deactivated'
      });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, account.acc_password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }
    
    // Set up session data with user information
    req.session.userId = parseInt(account.acc_id, 10);
    req.session.user = {
      userId: parseInt(account.acc_id, 10), 
      id: account.acc_id,
      username: account.acc_username,
      name: account.acc_name,
      accountType: account.acc_type,
      profilePic: account.profile_pic
    };
    console.log("Session created:", req.session);  // Debug log
    // Save the session
    req.session.save(err => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({
          success: false,
          message: 'Error creating session'
        });
      }
      console.log("Session saved successfully");  // Debug log
      // Continue with successful response
      res.status(200).json({
        success: true,
        message: 'Login successful',
        userId: account.acc_id,
        username: account.acc_username,
        accountType: account.acc_type,
        
      });
      
    });
    //reroute to home page
   
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error.message
    });
  }
});

// User registration route
router.post('/register', async (req, res) => {
  try {
    console.log('Register route accessed', req.body);
    console.log('Files received:', req.files); // Debug log for files
    
    // Generate unique account ID
    const lastAccount = await Account.findOne().sort({ acc_id: -1 });
    const newAccId = lastAccount ? lastAccount.acc_id + 1 : 1;
    
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // Default profile picture path
    let profilePicPath = '/Views/images/profilePictures/default-profile.png';
    
    // Handle profile picture upload if present
    if (req.files && req.files.profile_pic) {
      const profilePic = req.files.profile_pic;
      const fileName = `profile_${newAccId}_${Date.now()}${path.extname(profilePic.name)}`;
      const uploadDir = path.join(__dirname, '../Views/images/profilePictures');
      const uploadPath = path.join(uploadDir, fileName);
      
      try {
        // Ensure directory exists
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        // Move the uploaded file to the destination
        await profilePic.mv(uploadPath);
        
        // Set the profile picture path for the database
        profilePicPath = `/Views/images/profilePictures/${fileName}`;
        console.log("Profile picture saved at:", profilePicPath);
      } catch (uploadError) {
        console.error("Error saving profile picture:", uploadError);
        // Continue with default profile picture if upload fails
      }
    }

    // Create new account with profile picture path
    const newAccount = new Account({
        acc_id: newAccId,
        acc_name: req.body.username,
        acc_username: req.body.username,
        acc_bio: req.body.description || '',
        profile_pic: profilePicPath,
        saved_restos: [],
        saved_reviews: [],
        acc_password: hashedPassword,
        acc_type: req.body.accountType || 'user'
    });
    
    await newAccount.save();
    
    // Set up session data for automatic login after registration
    req.session.userId = parseInt(newAccount.acc_id, 10);
    req.session.user = {
      userId: parseInt(newAccount.acc_id, 10), 
      id: newAccount.acc_id,
      username: newAccount.acc_username,
      name: newAccount.acc_name,
      accountType: newAccount.acc_type,
      profilePic: newAccount.profile_pic
    };
    
    // Save the session
    req.session.save(err => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({
          success: false,
          message: 'Error creating session'
        });
      }
      
      // Continue with successful response
      res.status(201).json({
        success: true,
        message: 'Account created successfully',
        userId: newAccount.acc_id,
        username: newAccount.acc_username,
        accountType: newAccount.acc_type
      });
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during registration',
      error: error.message
    });
  }
});

// Add a logout route
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Error logging out'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  });
  console.log("Session destroyed successfully");  // Debug log
});

module.exports = router;