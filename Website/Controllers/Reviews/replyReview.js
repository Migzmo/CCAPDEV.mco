document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded, initializing reply review functionality');
    
    // Toggle reply form for reviews
    document.querySelectorAll('.reply-toggle-btn').forEach(button => {
        button.addEventListener('click', function() {
            const reviewId = this.getAttribute('data-review-id');
            const formContainer = this.closest('.reply-actions').nextElementSibling;
            
            // Toggle form visibility
            if (formContainer.style.display === 'none' || !formContainer.style.display) {
                formContainer.style.display = 'block';
                this.textContent = 'Cancel';
            } else {
                formContainer.style.display = 'none';
                this.textContent = 'Reply';
            }
        });
    });

    // Variables for delete reply confirmation
    let currentReplyId = null;
    let currentReviewId = null;
    const deleteReplyPopup = document.getElementById("deleteReplyConfirmPopup");
    const backdrop = document.getElementById("backdrop");
    
    // Function to show/hide delete reply confirmation popup
    function toggleDeleteReplyPopup(show, replyId = null, reviewId = null) {
        if (show) {
            currentReplyId = replyId;
            currentReviewId = reviewId;
        }
        
        deleteReplyPopup.style.display = show ? "block" : "none";
        backdrop.style.display = show ? "block" : "none";
    }
    
    // Close popup when clicking the X button
    document.getElementById("closeDeleteReplyConfirm").addEventListener("click", function() {
        toggleDeleteReplyPopup(false);
    });
    
    // Cancel button closes popup
    document.getElementById("cancelDeleteReply").addEventListener("click", function() {
        toggleDeleteReplyPopup(false);
    });
    
    // Confirm delete button
    document.getElementById("confirmDeleteReply").addEventListener("click", function() {
        if (!currentReplyId || !currentReviewId) return;
        
        deleteReply(currentReplyId, currentReviewId);
        toggleDeleteReplyPopup(false);
    });
    
    // CONSOLIDATED EVENT HANDLERS - Handle all form submissions
    document.addEventListener('submit', async function(e) {
        // Handle reply form submission (for both review replies and nested replies)
        if (e.target.classList.contains('reply-form')) {
            e.preventDefault();
            
            const reviewId = e.target.getAttribute('data-review-id');
            const parentId = e.target.getAttribute('data-parent-id') || null;
            const contentField = e.target.querySelector('.reply-content');
            const content = contentField.value.trim();
            
            if (!content) {
                alert('Please enter a reply');
                return;
            }
            
            try {
                const response = await fetch('/api/replies/add', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        review_id: reviewId,
                        content: content,
                        parent_id: parentId
                    })
                });
                
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Failed to add reply');
                }
                
                const result = await response.json();
                
                // Clear and hide form
                contentField.value = '';
                e.target.parentElement.style.display = 'none';
                
                // Handle different form types
                if (parentId) {
                    // This is a reply to a reply
                    const parentForm = e.target.closest('.reply-to-reply-form-container');
                    if (parentForm) {
                        const replyBtn = parentForm.previousElementSibling.querySelector('.reply-to-reply-btn');
                        if (replyBtn) {
                            replyBtn.textContent = 'Reply';
                        }
                        parentForm.style.display = 'none';
                    }
                } else {
                    // This is a reply to the review
                    const formContainer = e.target.closest('.reply-to-reply-form-container');
                    if (formContainer) {
                        const actionContainer = formContainer.previousElementSibling;
                        const toggleBtn = actionContainer.querySelector('.reply-toggle-btn');
                        if (toggleBtn) {
                            toggleBtn.textContent = 'Reply';
                        }
                        formContainer.style.display = 'none';
                    }
                }
                
                // Reload all replies for this review
                loadReplies(reviewId);
                
            } catch (error) {
                console.error('Error adding reply:', error);
                alert('Failed to add reply: ' + error.message);
            }
        }
        
        // Handle edit reply form submission
        if (e.target.classList.contains('edit-reply-form')) {
            e.preventDefault();
            
            const replyId = e.target.getAttribute('data-reply-id');
            const reviewId = e.target.getAttribute('data-review-id');
            const content = e.target.querySelector('.edit-reply-content').value.trim();
            
            if (!content) {
                alert('Please enter a reply');
                return;
            }
            
            try {
                const response = await fetch('/api/replies/edit', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        reply_id: replyId,
                        content: content
                    })
                });
                
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Failed to update reply');
                }
                
                const result = await response.json();
                
                // Hide the edit form
                e.target.parentElement.style.display = 'none';
                
                // Update the reply content
                const replyItem = e.target.closest('.reply-item');
                const contentElement = replyItem.querySelector('p');
                contentElement.textContent = content;
                
                // Update the date to show "Last Edited"
                const dateElement = replyItem.querySelector('.reply-date');
                if (result.reply && result.reply.last_edited_at) {
                    dateElement.textContent = 'Last Edited: ' + result.reply.last_edited_at;
                }
                
                // Reload all replies to update the UI
                loadReplies(reviewId);
                
            } catch (error) {
                console.error('Error updating reply:', error);
                alert('Failed to update reply: ' + error.message);
            }
        }
    });
    
    // CONSOLIDATED EVENT HANDLERS - Handle all click events
    document.addEventListener('click', function(e) {
        // Handle reply to reply clicks
        if (e.target.classList.contains('reply-to-reply-btn')) {
            const replyId = e.target.getAttribute('data-reply-id');
            const reviewId = e.target.getAttribute('data-review-id');
            const formContainer = e.target.closest('.reply-actions').nextElementSibling;
            
            // Make sure we're targeting the correct container
            if (formContainer && formContainer.classList.contains('reply-to-reply-form-container')) {
                // Toggle form visibility
                if (formContainer.style.display === 'none' || !formContainer.style.display) {
                    formContainer.style.display = 'block';
                    e.target.textContent = 'Cancel';
                } else {
                    formContainer.style.display = 'none';
                    e.target.textContent = 'Reply';
                }
            } else {
                console.error('Reply form container not found');
            }
        }
        
        // Cancel button for any reply form
        if (e.target.classList.contains('cancel-reply-btn')) {
            const form = e.target.closest('.reply-form');
            const formContainer = form.closest('.reply-to-reply-form-container');
            
            let toggleButton;
            
            if (formContainer) {
                // Find the associated toggle button
                const actionsContainer = formContainer.previousElementSibling;
                if (actionsContainer && actionsContainer.classList.contains('reply-actions')) {
                    toggleButton = actionsContainer.querySelector('.reply-to-reply-btn') || 
                                actionsContainer.querySelector('.reply-toggle-btn');
                }
                
                // Clear form and hide it
                form.querySelector('.reply-content').value = '';
                formContainer.style.display = 'none';
                
                // Reset button text
                if (toggleButton) {
                    toggleButton.textContent = 'Reply';
                }
            }
        }
        
        // Handle delete reply
        if (e.target.classList.contains('delete-reply')) {
            const replyId = e.target.getAttribute('data-id');
            const reviewId = e.target.closest('.scroll-obj').querySelector('input[name="review_id"]').value;
            
            // Show delete confirmation popup instead of confirm()
            toggleDeleteReplyPopup(true, replyId, reviewId);
        }
        
        // Handle edit reply button click
        if (e.target.classList.contains('edit-reply')) {
            const replyItem = e.target.closest('.reply-item');
            const replyId = e.target.getAttribute('data-id');
            const replyContent = replyItem.querySelector('p').textContent;
            
            // Show edit form and populate with current content
            const editForm = replyItem.querySelector('.edit-reply-form-container');
            const textArea = editForm.querySelector('.edit-reply-content');
            textArea.value = replyContent;
            
            // Show edit form
            editForm.style.display = 'block';
        }
        
        // Handle cancel edit button
        if (e.target.classList.contains('cancel-edit-reply-btn')) {
            const editForm = e.target.closest('.edit-reply-form-container');
            editForm.style.display = 'none';
        }
    });
    
    // Load existing replies for each review
    document.querySelectorAll('.scroll-obj').forEach(reviewElement => {
        const reviewId = reviewElement.querySelector('input[name="review_id"]');
        if (reviewId) {
            console.log('Loading replies for review:', reviewId.value);
            loadReplies(reviewId.value);
        } else {
            console.warn('Review element found without review_id input:', reviewElement);
        }
    });
});

// Delete a reply
async function deleteReply(replyId, reviewId) {
    try {
        console.log(`Deleting reply ${replyId} from review ${reviewId}`);
        const response = await fetch('/api/replies/archive', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                reply_id: replyId
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete reply');
        }
        
        // Reload all replies to update the UI
        loadReplies(reviewId);
        
    } catch (error) {
        console.error('Error deleting reply:', error);
        alert('Failed to delete reply: ' + error.message);
    }
}

// Load replies for a review
async function loadReplies(reviewId) {
    try {
        console.log(`Fetching replies for review ${reviewId}`);
        const response = await fetch(`/api/replies/${reviewId}`);
        
        if (!response.ok) {
            throw new Error('Failed to load replies');
        }
        
        const data = await response.json();
        console.log('Reply data received:', data);
        
        // Get the container for this review's replies
        const reviewInput = document.querySelector(`input[name="review_id"][value="${reviewId}"]`);
        if (!reviewInput) {
            // Try alternate selectors if the first one fails
            const alternateInput = document.querySelector(`#hidden-review-id[value="${reviewId}"]`);
            if (!alternateInput) {
                console.error(`No input element found with reviewId ${reviewId}`);
                return;
            }
        }
        
        const reviewElement = reviewInput.closest('.scroll-obj');
        const repliesContainer = reviewElement.querySelector('.review-replies');
        
        if (!repliesContainer) {
            console.error(`No .review-replies container found for review ${reviewId}`);
            return;
        }
        
        // Clear existing replies
        repliesContainer.innerHTML = '';
        
        // Add each reply to the UI
        if (data.success && data.replies && data.replies.length > 0) {
            data.replies.forEach(reply => {
                addReplyToUI(reviewId, reply, repliesContainer);
            });
        }

        // Recreate the reply action elements
        const newToggleBtn = document.createElement('div');
        newToggleBtn.className = 'reply-actions';
        newToggleBtn.innerHTML = `
            <button class="reply-toggle-btn" data-review-id="${reviewId}">Reply</button>
            <span class="reply-date"></span>
        `;
        repliesContainer.appendChild(newToggleBtn);

        const newFormContainer = document.createElement('div');
        newFormContainer.className = 'reply-to-reply-form-container';
        newFormContainer.style.display = 'none';
        newFormContainer.innerHTML = `
            <form class="reply-form" data-review-id="${reviewId}">
                <textarea class="reply-content" placeholder="Write your reply..." required></textarea>
                <div class="reply-buttons">
                    <button type="submit" class="submit-reply-btn">Submit</button>
                    <button type="button" class="cancel-reply-btn">Cancel</button>
                </div>
            </form>
        `;
        repliesContainer.appendChild(newFormContainer);
        
        // Add event listener to the new reply toggle button
        const newButton = newToggleBtn.querySelector('.reply-toggle-btn');
        if (newButton) {
            newButton.addEventListener('click', function() {
                const formContainer = this.closest('.reply-actions').nextElementSibling;
                
                // Toggle form visibility
                if (formContainer.style.display === 'none' || !formContainer.style.display) {
                    formContainer.style.display = 'block';
                    this.textContent = 'Cancel';
                } else {
                    formContainer.style.display = 'none';
                    this.textContent = 'Reply';
                }
            });
        }
        
    } catch (error) {
        console.error('Error loading replies:', error);
    }
}

// Recursively add replies and their children to the UI
function addReplyToUI(reviewId, reply, container) {
    // Create reply element
    const replyElement = document.createElement('div');
    replyElement.className = 'reply-item';
    replyElement.setAttribute('data-id', reply.reply_id);
    
    // Build reply HTML
    let replyHTML = `
        <div class="reply-header">
    `;
    
    if (reply.account_id) {
        replyHTML += `
            <a href="/profile/${reply.account_id.acc_id}">
                <img src="${reply.account_id.profile_pic || '../Views/images/profilePictures/default-profile.png'}" 
                     alt="Profile" class="profile-pic-small" 
                     onerror="this.src='/images/profilePictures/default-profile.png'"> 
                ${reply.account_id.acc_name}
            </a>
        `;
    } else {
        replyHTML += `
            <span>
                <img src="../Views/images/profilePictures/default-profile.png" alt="Profile" class="profile-pic-small">
                Anonymous
            </span>
        `;
    }
       
    if (reply.canDelete) {
        replyHTML += `
            <button class="delete-reply" data-id="${reply.reply_id}">🗑️</button>
            <button class="edit-reply" data-id="${reply.reply_id}">✏️</button>
        `;
    }
    
    replyHTML += `
            </div>
            <p>${reply.content}</p>
            
            <!-- Add edit form container here -->
            <div class="edit-reply-form-container" style="display: none;">
                <form class="edit-reply-form" data-reply-id="${reply.reply_id}" data-review-id="${reviewId}">
                    <textarea class="edit-reply-content" placeholder="Edit your reply..." required></textarea>
                    <div class="reply-buttons">
                        <button type="submit" class="submit-edit-reply-btn">Update</button>
                        <button type="button" class="cancel-edit-reply-btn">Cancel</button>
                    </div>
                </form>
            </div>
            
            <div class="reply-actions">
                <button class="reply-to-reply-btn" data-reply-id="${reply.reply_id}" data-review-id="${reviewId}">Reply</button>
                <span class="reply-date">
                    ${reply.isEdited ? 'Last Edited: ' + reply.editedDate : 'Posted on ' + reply.created_at}
                </span>
            </div>
            <div class="reply-to-reply-form-container" style="display: none;">
                <form class="reply-form" data-review-id="${reviewId}" data-parent-id="${reply.reply_id}">
                    <textarea class="reply-content" placeholder="Write your reply..." required></textarea>
                    <div class="reply-buttons">
                        <button type="submit" class="submit-reply-btn">Submit</button>
                        <button type="button" class="cancel-reply-btn">Cancel</button>
                    </div>
                </form>
            </div>
    `;
    
    replyElement.innerHTML = replyHTML;
    container.appendChild(replyElement);
    
    // Add children if any
    if (reply.children && reply.children.length > 0) {
        const childrenContainer = document.createElement('div');
        childrenContainer.className = 'reply-children';
        replyElement.appendChild(childrenContainer);
        
        reply.children.forEach(childReply => {
            addReplyToUI(reviewId, childReply, childrenContainer);
        });
    }
}