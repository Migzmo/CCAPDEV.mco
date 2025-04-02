const express = require('express');
const router = express.Router();
const { Account, Restaurant } = require('../Models/lasappDB');

// Get saved restaurants for a user
router.get('/saved-restaurants/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        console.log(`Fetching saved restaurants for user: ${userId}`);
        
        // Find the user and their saved restaurant IDs
        const user = await Account.findOne({ acc_id: userId });
        if (!user) {
            console.log(`User not found with ID: ${userId}`);
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        console.log(`Found user: ${user.username}, saved restaurants: ${user.saved_restos}`);
        
        // If no saved restaurants, return empty array
        if (!user.saved_restos || user.saved_restos.length === 0) {
            console.log('No saved restaurants found');
            return res.json([]);
        }
        
        // Get full details of all saved restaurants
        const savedRestaurants = await Restaurant.find({
            resto_id: { $in: user.saved_restos }
        });
        
        console.log(`Found ${savedRestaurants.length} saved restaurants`);
        
        return res.json(savedRestaurants);
    } catch (error) {
        console.error('Error in /saved-restaurants/:userId endpoint:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch saved restaurants',
            error: error.message,
            stack: process.env.NODE_ENV === 'production' ? null : error.stack
        });
    }
});

module.exports = router;