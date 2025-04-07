const express = require('express');
const router = express.Router();
const { Reply, Review } = require('../Models/lasappDB');
const { isAuthenticated, isAuthenticatedApi } = require('./configs');

// Get replies for a review
router.get('/:reviewId', async (req, res) => {
    try {
      const reviewId = parseInt(req.params.reviewId, 10);
      
      if (isNaN(reviewId)) {
        return res.status(400).json({ success: false, message: 'Invalid review ID' });
      }
      
      // Get all replies for this review
      const allReplies = await Reply.find({ 
        review_id: reviewId,
        isAlive: true 
      }).populate({
        path: 'account_id',
        localField: 'account_id',
        foreignField: 'acc_id',
        model: 'Account'
      }).sort('created_at');
      
      // Format replies for the client
      const formattedReplies = allReplies.map(reply => {
        // Check if current user can delete this reply
        // Add null check for account_id to prevent TypeError
        const canDelete = req.session.userId && (
          (reply.account_id && reply.account_id.acc_id && req.session.userId === reply.account_id.acc_id) || 
          req.session.userType === 'admin'
        );
        
        // Format the date fields and add isEdited flag
        const created_at = new Date(reply.created_at).toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

        // Format the edit date if it exists
        let editedDate = null;
        if (reply.last_edited_at) {
          editedDate = new Date(reply.last_edited_at).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
        }

        return {
          reply_id: reply.reply_id,
          review_id: reply.review_id,
          // Ensure account_id is properly handled even if null
          account_id: reply.account_id || null,
          content: reply.content,
          parent_id: reply.parent_id,
          created_at: created_at,
          editedDate: editedDate,
          isEdited: !!reply.last_edited_at,
          canDelete,
          children: []
        };
      });
      
      // Organize into hierarchical structure
      const replyMap = {};
      const rootReplies = [];
      
      // First, create a map for fast lookups
      formattedReplies.forEach(reply => {
        replyMap[reply.reply_id] = reply;
      });
      
      // Then, organize into a tree structure
      formattedReplies.forEach(reply => {
        if (reply.parent_id) {
          // This is a child reply
          if (replyMap[reply.parent_id]) {
            replyMap[reply.parent_id].children.push(reply);
          } else {
            // If parent doesn't exist, add to root (fallback)
            rootReplies.push(reply);
          }
        } else {
          // This is a root reply
          rootReplies.push(reply);
        }
      });
      
      res.status(200).json({
        success: true,
        replies: rootReplies // Send only root replies, children are nested
      });
    } catch (error) {
      console.error('Error fetching replies:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch replies',
        error: error.message 
      });
    }
  });

// Add a new reply
router.post('/add', isAuthenticatedApi, async (req, res) => {
  try {
    const { review_id, content, parent_id } = req.body;
    
    if (!review_id || !content) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields" 
      });
    }
    
    // Get current user from session
    const accountId = req.session.userId;
    
    // Make sure review exists
    const review = await Review.findOne({ 
      review_id: parseInt(review_id, 10),
      isAlive: true
    });
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found"
      });
    }
    
    // Create new reply ID
    const highestReply = await Reply.findOne().sort('-reply_id');
    const newReplyId = highestReply ? highestReply.reply_id + 1 : 1;
    
    // Create new reply
    const newReply = new Reply({
        reply_id: newReplyId,
        review_id: parseInt(review_id, 10),
        account_id: accountId,
        content: content,
        parent_id: parent_id ? parseInt(parent_id, 10) : null,
        created_at: new Date()
      });
    
    // Save the reply
    await newReply.save();
    
    // Populate account info for response
    const populatedReply = await Reply.findOne({ reply_id: newReplyId })
      .populate({
        path: 'account_id',
        localField: 'account_id',
        foreignField: 'acc_id',
        model: 'Account'
      });
    
    res.status(201).json({
      success: true,
      message: "Reply added successfully",
      reply: {
        reply_id: populatedReply.reply_id,
        review_id: populatedReply.review_id,
        account_id: populatedReply.account_id,
        content: populatedReply.content,
        created_at: new Date(populatedReply.created_at).toLocaleString(),
        canDelete: true
      }
    });
  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).json({
      success: false,
      message: "Failed to add reply",
      error: error.message
    });
  }
});

// Delete (archive) a reply
router.put('/archive', isAuthenticatedApi, async (req, res) => {
  try {
    const { reply_id } = req.body;
    
    if (!reply_id) {
      return res.status(400).json({ 
        success: false, 
        message: "reply_id is required" 
      });
    }
    
    const replyId = parseInt(reply_id, 10);
    
    // Find the reply with populated account info
    const reply = await Reply.findOne({ reply_id: replyId }).populate({
      path: 'account_id',
      localField: 'account_id',
      foreignField: 'acc_id',
      model: 'Account'
    });
    
    if (!reply) {
      return res.status(404).json({ 
        success: false, 
        message: "Reply not found" 
      });
    }
    
    // Check if user has permission to delete (fix the comparison)
    if ((!reply.account_id || reply.account_id.acc_id !== req.session.userId) && req.session.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to delete this reply"
      });
    }
    
    // Archive the reply
    reply.isAlive = false;
    await reply.save();
    
    res.status(200).json({
      success: true,
      message: "Reply archived successfully"
    });
  } catch (error) {
    console.error('Error archiving reply:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to archive reply', 
      error: error.message 
    });
  }
});

// Edit a reply
router.put('/edit', isAuthenticatedApi, async (req, res) => {
  try {
    const { reply_id, content } = req.body;
    
    if (!reply_id || !content) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields" 
      });
    }
    
    const replyId = parseInt(reply_id, 10);
    
    // Find the reply
    const reply = await Reply.findOne({ reply_id: replyId });
    
    if (!reply) {
      return res.status(404).json({ 
        success: false, 
        message: "Reply not found" 
      });
    }
    
    // Check if user has permission to edit
    if (reply.account_id !== req.session.userId && req.session.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to edit this reply"
      });
    }
    
    // Update the reply
    reply.content = content;
    reply.last_edited_at = new Date(); // Add this line to record edit time
    await reply.save();

    res.status(200).json({
      success: true,
      message: "Reply updated successfully",
      reply: {
        reply_id: reply.reply_id,
        content: reply.content,
        created_at: new Date(reply.created_at).toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        last_edited_at: new Date().toLocaleString('en-US', {  // Add this to return the edit time
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        isEdited: true  // Add this flag
      }
    });
  } catch (error) {
    console.error('Error updating reply:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update reply', 
      error: error.message 
    });
  }
});

module.exports = router;