/*
This file contains authentication routes including login and registration
*/

const bcrypt = require('bcrypt'); 
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
    const isMatch = await bcrypt.compare(password, account.acc_password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }
    
    // Set up session data with user information
    req.session.userId = account.acc_id;
    req.session.user = {
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
    // Generate unique account ID
    const lastAccount = await Account.findOne().sort({ acc_id: -1 });
    const newAccId = lastAccount ? lastAccount.acc_id + 1 : 1;
    
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // Create new account with absolute path for profile picture
    const newAccount = new Account({
        acc_id: newAccId,
        acc_name: req.body.username,
        acc_username: req.body.username,
        acc_bio: req.body.description || '',
        profile_pic: req.body.profilePic || '/Views/images/profilePictures/default-profile.png',
        saved_restos: [],
        saved_reviews: [],
        acc_password: hashedPassword,
        acc_type: req.body.accountType || 'user'
    });
    
    await newAccount.save();
    
    // Set up session data for automatic login after registration
    req.session.userId = newAccount.acc_id;
    req.session.user = {
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

// Logout route
router.post('/logout', (req, res) => {
  // Clear the session
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ success: false, message: 'Error during logout' });
    }
    // Session destroyed successfully
    res.clearCookie('connect.sid'); // Clear the session cookie
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

// Verify session endpoint
router.get('/verify-session', (req, res) => {
  if (req.session && req.session.userId) {
    return res.json({
      authenticated: true,
      userId: req.session.userId,
      username: req.session.user?.username || null
    });
  }
  
  return res.json({
    authenticated: false
  });
});

module.exports = router;