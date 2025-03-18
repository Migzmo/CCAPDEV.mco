/*
Developers:
1. Bon Aquino 
2. Adler Strebel
3. Karl Matthew Dela Cruz
4. Jose Miguel Espinosa

last edited: 14/03/2025 
To be done:
di ko alam HAHAHHAHAHA
*/
/****************************************************************************************************************************************************************************/
//This Section is Responsible for initializing the Database and importing the sample data, as well as initializing all needed modules.

//For Initializing mongoose
const mongoose = require('mongoose');
const fs = require('fs');

//For Initializing express
const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const app = express();
const imagesDir = path.join(__dirname, 'public/images/restaurants');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}
const profilesDir = path.join(__dirname, 'public/images/profiles');
if (!fs.existsSync(profilesDir)) { 
  fs.mkdirSync(profilesDir, { recursive: true }); 
}

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload({ 
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit - TODO: Adjust as needed
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));

//For importing sample data to MONGO DB
let impErr1= false;
let impErr2= false;
let impErr3= false;
let impErr4= false;

mongoose.connect('mongodb://localhost/lasappDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Import Accounts
      if (fs.existsSync('accounts.json')) {
        const accountData = JSON.parse(fs.readFileSync('accounts.json', 'utf8'));
        await Account.deleteMany({});
        await Account.insertMany(accountData);
        console.log('Account data imported successfully');
        
      }else{
        impErr1= true;
      }
      
      // Import Cuisines
      if (fs.existsSync('cuisines.json')) {
        const cuisineData = JSON.parse(fs.readFileSync('cuisines.json', 'utf8'));
        await Cuisine.deleteMany({});
        await Cuisine.insertMany(cuisineData);
        console.log('Cuisine data imported successfully');
      }else{
        impErr2= true;
      }
      
      // Import Restaurants
      if (fs.existsSync('restaurants.json')) {
        const restaurantData = JSON.parse(fs.readFileSync('restaurants.json', 'utf8'));
        await Restaurant.deleteMany({});
        await Restaurant.insertMany(restaurantData);
        console.log('Restaurant data imported successfully');
      }else{
        impErr3= true;
      }
      
      // Import Reviews
      if (fs.existsSync('reviews.json')) {
        const reviewData = JSON.parse(fs.readFileSync('reviews.json', 'utf8'));
        await Review.deleteMany({});
        await Review.insertMany(reviewData);
        console.log('Review data imported successfully');
      }{
        impErr4= true;
      }
      if(impErr1 && impErr2 && impErr3 && impErr4){
        console.log('Missing Data');
      }else{
        console.log('All data imported successfully!');
      }
      
    } catch (err) {
      console.error('Import error:', err);
    } 
  })
  .catch(err => console.error('Connection error:', err));
// Initialize our Reviews
const { Account, Cuisine, Restaurant, Review } = require("./database/models/lasappDB");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(__dirname));

var hbs = require('hbs')
app.set('view engine','hbs');

//auth routes


/****************************************************************************************************************************************************************************/
//This Section is responsible for routing and rendering the pages

/***************************************************************************************************************************************/
//User API Routes
app.post('/api/auth/login', async (req, res) => {
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




app.get('/api/users/:id', async (req, res) => {
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
});

app.post('/api/auth/register', async (req, res) => {
    try {
        console.log('Register route accessed', req.body);
        // Generate unique account ID
        const lastAccount = await Account.findOne().sort({ acc_id: -1 });
        const newAccId = lastAccount ? lastAccount.acc_id + 1 : 1;
        // Create new account
        const newAccount = new Account({
            acc_id: newAccId,
            acc_name: req.body.username,
            acc_username: req.body.username,
            acc_bio: req.body.description || '',
            profile_pic: req.body.profilePic || '',
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
        // Handle duplicate username error
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Username already exists' 
            }); 
        }
        res.status(500).json({
            success: false,
            message: 'Error creating account',
            error: error.message
        });
    }
});

app.post('/api/users/update-profile', async (req, res) => {
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
      const uploadPath = path.join(__dirname, 'public/images/profiles', fileName);
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
});


//render profile page using handlebars this will fetch data in mongo db 
app.get('/profile/:id', async function (req, res) {
    try{
        const accountId = parseInt(req.params.id, 10);
        console.log(`Account ID: ${accountId}`);
        const account = await Account.findOne({acc_id: accountId});
        if(!account){
            return res.status(404).send('Account not found');
    }else{
        console.log("Sucessfully found account");
        
    }
    res.render('Profile', {
        account: {
            name: account.acc_name,
            username: account.acc_username,
            bio: account.acc_bio,
            image: account.profile_pic
        },
    });
    }catch(err){
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.post('/api/users/update-profile', async (req, res) => {
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
  const uploadPath = path.join(__dirname, 'public/images/profiles', fileName);
  
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

});







/***************************************************************************************************************************************/
//Restaurants API Routes

app.put('/api/submitupdate', async (req, res) => {
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
      resto_perks: req.body.perks
    };
    
    // Handle image upload if present
    if (req.files && req.files.image) {
      const image = req.files.image;
      const fileName = `restaurant_${restaurantId}_${Date.now()}${path.extname(image.name)}`;
      
      // Create destination path
      const filePath = path.join(__dirname, 'public/images/restaurants', fileName);
      
      try {
        
        await image.mv(filePath);
        
        // Set the image path for database update
        updateData.resto_img = `/images/restaurants/${fileName}`;
        console.log("Image updated to:", updateData.resto_img);
        
        
        const currentRestaurant = await Restaurant.findOne({ resto_id: restaurantId });
        
      } catch (imageError) {
        console.error("Error processing image:", imageError);
        // Continue with update even if image processing fails
      }
    }
    
    console.log("Mapped update data:", updateData);
    
   
    if (req.body.cuisine_name) {
      
    }
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

// This will render the LaSapp homepage using handlebars
app.get('/', async function (req, res) {
  try {
    const restaurants = await Restaurant.find({isAlive:true});
    console.log("Successfully found restaurants:", restaurants);
    res.render('LaSapp', { restaurants: restaurants });
  } catch (err) { // Fix: Catch error correctly
    console.error('Error fetching restaurants:', err);
    res.status(500).send('Server Error');
  }
});

//Delete restaurant API route
app.delete('/api/restaurant/:id', async (req, res) => {
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

//Create restaurant API route
app.post('/', async (req, res) => {
    try {
        console.log("Received restaurant submission");
      // Find highest existing resto_id
        const highestRestaurant = await Restaurant.findOne().sort('-resto_id');
        const newRestoId = highestRestaurant ? highestRestaurant.resto_id + 1 : 1;
     
      // Default image path
        let imagePath = '/views/CSS/RestoImages/default-restaurant.jpg';
      
        if (req.files && req.files.image) {
          const image = req.files.image;
          // Use newRestoId instead of restaurantId
          const fileName = `restaurant_${newRestoId}_${Date.now()}${path.extname(image.name)}`;
          
          // Create destination path
          const filePath = path.join(__dirname, 'public/images/restaurants', fileName);
          
          try {
              // Move the uploaded file to the destination
              await image.mv(filePath);
              
              // Set the image path for the new restaurant
              // Update imagePath instead of using undefined updateData variable
              imagePath = `/images/restaurants/${fileName}`;
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
            resto_owner_id: 0 
        });
      await newRestaurant.save();
      res.status(201).json({
            success: true,
            message: 'Restaurant added successfully',
            resto_id: newRestoId
        });
    } catch (error) {
        console.error('Error adding restaurant:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add restaurant',
            error: error.message
        });
    }
});

//This will render the restaurant page using handlebars
app.get('/restaurant/:id', async function (req, res) {
  try {
      const restaurantId = parseInt(req.params.id, 10); // Convert the ID to an integer //10 might cause issue check later
      console.log(`Restaurant ID: ${restaurantId}`); // Print the ID to the console
      const restaurant = await Restaurant.findOne({resto_id: restaurantId, isAlive:true});
      if (!restaurant) {
          return res.status(404).send('Restaurant not found');
      }else{
          console.log("Sucessfully found restaurant");
      }
      //this will get the reviews for the restaurant and also populate the account_id field with user data
      var reviews = await Review.find({resto_id: restaurantId,isAlive:true}).populate({
        path: 'account_id',
        localField: 'account_id',
        foreignField: 'acc_id',
        model: 'Account'}).exec();
      if(!reviews){
          console.log("No reviews found");
      }else{
        console.log(`Found ${reviews.length} reviews`);
      }
      //This will render restaurant handlbar 
      res.render('restaurant', {
          restaurant: {
              id: restaurant.resto_id,
              name: restaurant.resto_name,
              location: restaurant.resto_address,
              image: restaurant.resto_img,
              address: restaurant.resto_address,
              time: restaurant.resto_time,
              phone: restaurant.resto_phone,
              email: restaurant.resto_email,
              payment: restaurant.resto_payment,
              perks: restaurant.resto_perks.split(', '),
              cuisine: restaurant.cuisine_id 
          },
          reviews:reviews
      });
  } catch (err) {
      console.error(err); // Log the error details to the console
      res.status(500).send('Server Error');
  }
});









/***************************************************************************************************************************************/
//Review API Routes


app.post('/api/addreview', async (req, res) => {
  try {
    // Get data from request
    const { resto_id, rating, review } = req.body;
    
    // Validate data
    if (!resto_id || !rating || !review) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields" 
      });
    }
    
    
    const accountId = 1; // Use a valid account ID that exists in database
    
    // Create new review ID
    const highestReview = await Review.findOne().sort('-review_id');
    const newReviewId = highestReview ? highestReview.review_id + 1 : 1;
    
    // Create new review
    const newReview = new Review({
      review_id: newReviewId,
      account_id: accountId, // Using default account for now
      resto_id: parseInt(resto_id, 10),
      rating: parseInt(rating, 10),
      review: review,
      isAlive: true
    });
    
    // Save the review
    await newReview.save();
    console.log("Review saved:", newReview);
    
    
    try {
      await Restaurant.findOneAndUpdate(
        { resto_id: parseInt(resto_id, 10) },
        { $push: { resto_reviews: newReviewId } }
      );
    } catch (updateError) {
      console.error("Error updating restaurant with review:", updateError);
      // Continue anyway since review is saved
    }
    
    // Return success
    res.status(201).json({
      success: true,
      message: "Review added successfully",
      review_id: newReviewId
    });
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({
      success: false,
      message: "Failed to add review",
      error: error.message
    });
  }
});

app.put('/api/editreview', async (req, res) => {
  try {
    console.log("Received Edit Review Request:", req.body);
    const { review_id, rating, review } = req.body;
    
    if (!review_id) {
      return res.status(400).json({ success: false, message: "review_id is required" });
    }
    const reviewId = parseInt(review_id, 10);
    const updateData = {
      rating: parseInt(rating, 10), 
      review: review                
    };

    console.log("Update data:", updateData);
    
    // Find and update review
    const updatedReview = await Review.findOneAndUpdate(
      { review_id: reviewId },
      updateData,
      { new: true }
    );
    
    if (!updatedReview) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    
    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      review: updatedReview,
      review_id: reviewId
    });
  } catch(error) {
    console.error('Error updating review:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update review', 
      error: error.message 
    });
  }
});

// CHANGE SHOULD BE ARHCHIVED NOT DELETE!!!! 
app.delete("/api/deletereview/:id", async (req,res) => {
  const reviewID = req.params.id;
  try {
    const result = await db.query("DELETE FROM reviews WHERE review_id = ?", [reviewID]);

    if (result.affectedRows > 0) {
        res.status(200).json({ message: "Review deleted successfully." });
    } else {
        res.status(404).json({ message: "Review not found." });
    }
  } catch (error) {
      console.error("Error deleting review:", error);
      res.status(500).json({ message: "Failed to delete review." });
  }
});

/***************************************************************************************************************************************/

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Server error',
        error: err.message
    });
});



//This blocks access to the database for now idk yet
app.use('/database', function (req, res, next) {
    res.status(403).send('Access denied');
});
/*
// Directs to Lasapp homepage
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'Lasapp.hbs'));
});*/

// Start server
app.listen(3000, function () {
    console.log('Node server is running on http://localhost:3000');
});

/****************************************************************************************************************************************************************************/