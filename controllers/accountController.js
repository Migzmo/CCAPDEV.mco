// controllers/accountController.js
const Account = require('../models/account');
const path = require('path');

// Get all accounts
exports.getAllAccounts = async (req, res) => {
  try {
    const accounts = await Account.find({ isAlive: true });
    res.json(accounts);
  } catch (error) {
    console.error('Error getting accounts:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving accounts',
      error: error.message
    });
  }
};

// Get single account by ID
exports.getAccountById = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const account = await Account.findOne({ acc_id: userId });
    
    if (!account) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
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
};

// Login
exports.login = async (req, res) => {
  try {
    console.log('Login request:', req.body);
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
};

// Register
exports.register = async (req, res) => {
  try {
    console.log('Register request:', req.body);
    
    // Generate unique account ID
    const lastAccount = await Account.findOne().sort({ acc_id: -1 });
    const newAccId = lastAccount ? lastAccount.acc_id + 1 : 1;
    
    // Create new account
    const newAccount = new Account({
      acc_id: newAccId,
      acc_name: req.body.username,
      acc_username: req.body.username,
      acc_bio: req.body.description || '',
      profile_pic: req.body.profilePic || '/images/profiles/default-profile.png',
      saved_restos: [],
      saved_reviews: [],
      acc_password: req.body.password,
      acc_type: req.body.accountType || 'user'
    });
    
    await newAccount.save();
    
    // Return login information
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
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    console.log('Update profile request:', req.body);
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
    if (req.body.username) account.acc_username = req.body.username;
    if (req.body.bio) account.acc_bio = req.body.bio;

    // Update password if provided
    if (req.body.password && req.body.password.trim() !== '') {
      account.acc_password = req.body.password;
    }
    
    // Handle profile picture upload
    if (req.files && req.files.profile_pic) {
      const profilePic = req.files.profile_pic;
      const fileName = `profile_${userId}_${Date.now()}${path.extname(profilePic.name)}`;
      const uploadPath = path.join(__dirname, '../public/images/profiles', fileName);
      
      await profilePic.mv(uploadPath);
      account.profile_pic = `/images/profiles/${fileName}`;
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
};

// Delete (deactivate) account
exports.deleteAccount = async (req, res) => {
  try {
    console.log('Delete account request:', req.body);
    const userId = req.body.userId;
    
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
    
    // Update account status (soft delete)
    account.isAlive = false;
    await account.save();
    
    // Set content type explicitly
    res.setHeader('Content-Type', 'application/json');
    
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
};

// Render profile page
exports.renderProfile = async (req, res) => {
  try {
    const accountId = parseInt(req.params.id, 10);
    console.log(`Rendering profile for Account ID: ${accountId}`);
    
    // Get the current user ID from the query string if available
    const currentUserId = req.query.currentUser ? parseInt(req.query.currentUser) : null;
    
    // Find the account
    const account = await Account.findOne({acc_id: accountId, isAlive: true});
    if (!account) {
      return res.status(404).send('Account not found');
    }
    
    const Review = require('../models/review');
    
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
    
    // Render the profile page
    res.render('account/profile', {
      account: {
        id: account.acc_id,
        name: account.acc_name,
        username: account.acc_username,
        bio: account.acc_bio,
        profile_pic: account.profile_pic || '/images/profiles/default-profile.png'
      },
      isOwnProfile: isOwnProfile,
      reviews: formattedReviews,
      layout: 'main'
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};