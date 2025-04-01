/*
This file contains authentication routes including login and registration
*/

const express = require('express');
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
    if (account.acc_password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      }); 
    }
  
    res.status(200).json({
      success: true,
      message: 'Login successful',
      userId: account.acc_id,
      username: account.acc_username,
      accountType: account.acc_type
    });
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
    // Generate unique account ID
    const lastAccount = await Account.findOne().sort({ acc_id: -1 });
    const newAccId = lastAccount ? lastAccount.acc_id + 1 : 1;
    
    // Create new account with absolute path for profile picture
    const newAccount = new Account({
        acc_id: newAccId,
        acc_name: req.body.username,
        acc_username: req.body.username,
        acc_bio: req.body.description || '',
        profile_pic: req.body.profilePic || '/Views/images/profilePictures/default-profile.png',
        saved_restos: [],
        saved_reviews: [],
        acc_password: req.body.password,
        acc_type: req.body.accountType || 'user'
    });
    
    await newAccount.save();
    
    // Return login information similar to login endpoint
    res.status(201).json({
        success: true,
        message: 'Account created successfully',
        userId: newAccount.acc_id,
        username: newAccount.acc_username,
        accountType: newAccount.acc_type
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

module.exports = router;