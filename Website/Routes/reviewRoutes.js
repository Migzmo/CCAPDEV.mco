/*
This file contains review-related routes including adding, editing, and deleting reviews
*/

const express = require('express');
const router = express.Router();
const { Review } = require('../Models/lasappDB');

// Add a new review
router.post('/add', async (req, res) => {
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
    
    // Get current user from token or session
    const currentUser = req.body.userId;
    const accountId = currentUser ? parseInt(currentUser) : 1; // Use provided ID or default
    
    // Create new review ID
    const highestReview = await Review.findOne().sort('-review_id');
    const newReviewId = highestReview ? highestReview.review_id + 1 : 1;
    
    // Create new review with proper account_id
    const newReview = new Review({
      review_id: newReviewId,
      account_id: accountId,
      resto_id: parseInt(resto_id, 10),
      rating: parseInt(rating, 10),
      review: review,
      isAlive: true
    });
    
    // Save the review
    await newReview.save();
    console.log("Review saved:", newReview);
    
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

// Edit an existing review
router.put('/edit', async (req, res) => {
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

// Archive (soft delete) a review
router.put('/archivereview', async (req, res) => {
  const reviewID = req.body.review_id;
  console.log("Received Archive Review Request:", reviewID);
  try {
    const updatedReview = await Review.findOneAndUpdate(
      { review_id: reviewID },
      { isAlive: false },
      { new: true }
    );
    
    if (!updatedReview) {
      return res.status(404).json({ message: "Review not found." });
    }
    
    res.status(200).json({ 
      message: "Review archived successfully.", 
      review: updatedReview 
    });
  } catch (error) {
    console.error("Error archiving review:", error);
    res.status(500).json({ message: "Failed to archive review." });
  }
});

// Get a single review by ID
router.get('/:id', async (req, res) => {
  try {
    const reviewId = parseInt(req.params.id, 10);
    
    if (isNaN(reviewId)) {
      return res.status(400).json({ success: false, message: 'Invalid review ID' });
    }
    
    const review = await Review.findOne({ review_id: reviewId });
    
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    
    res.status(200).json({
      success: true,
      review_id: review.review_id,
      rating: review.rating,
      review: review.review,
      account_id: review.account_id
    });
  } catch (error) {
    console.error('Error fetching review:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch review', error: error.message });
  }
});
module.exports = router;