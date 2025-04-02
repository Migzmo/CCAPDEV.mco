document.addEventListener('DOMContentLoaded', function() {
    // Toggle reply form for reviews
    document.querySelectorAll('.reply-toggle-btn').forEach(button => {
        button.addEventListener('click', function() {
            const reviewId = this.getAttribute('data-review-id');
            const formContainer = this.nextElementSibling;
            
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
    
    // Handle reply form submission (for both review replies and nested replies)
    document.addEventListener('submit', async function(e) {
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
                    const replyBtn = parentForm.previousElementSibling;
                    replyBtn.textContent = 'Reply';
                    
                    // Reload all replies for this review to show the new nested structure
                    loadReplies(reviewId);
                } else {
                    // This is a reply to the review
                    const toggleBtn = e.target.parentElement.previousElementSibling;
                    toggleBtn.textContent = 'Reply';
                    
                    // Reload all replies for this review
                    loadReplies(reviewId);
                }
                
            } catch (error) {
                console.error('Error adding reply:', error);
                alert('Failed to add reply: ' + error.message);
            }
        }
    });
    
    // Handle reply to reply clicks (delegated)
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('reply-to-reply-btn')) {
            const replyId = e.target.getAttribute('data-reply-id');
            const reviewId = e.target.getAttribute('data-review-id');
            const formContainer = e.target.nextElementSibling;
            
            // Toggle form visibility
            if (formContainer.style.display === 'none' || !formContainer.style.display) {
                formContainer.style.display = 'block';
                e.target.textContent = 'Cancel';
            } else {
                formContainer.style.display = 'none';
                e.target.textContent = 'Reply';
            }
        }
        
        // Cancel button for any reply form
        if (e.target.classList.contains('cancel-reply-btn')) {
            const form = e.target.closest('.reply-form');
            const formContainer = form.parentElement;
            let toggleButton;
            
            if (formContainer.classList.contains('reply-to-reply-form-container')) {
                toggleButton = formContainer.previousElementSibling; // The reply-to-reply button
            } else {
                toggleButton = formContainer.previousElementSibling; // The main reply button
            }
            
            // Clear form and hide it
            form.querySelector('.reply-content').value = '';
            formContainer.style.display = 'none';
            toggleButton.textContent = 'Reply';
        }
        
        // Handle delete reply
        if (e.target.classList.contains('delete-reply')) {
            if (!confirm('Are you sure you want to delete this reply?')) {
                return;
            }
            
            const replyId = e.target.getAttribute('data-id');
            const reviewId = e.target.closest('.scroll-obj').querySelector('input[name="review_id"]').value;
            
            deleteReply(replyId, reviewId);
        }
    });
    
    // Load existing replies for each review
    document.querySelectorAll('.scroll-obj').forEach(reviewElement => {
        const reviewId = reviewElement.querySelector('input[name="review_id"]').value;
        loadReplies(reviewId);
    });
});

// Delete a reply
async function deleteReply(replyId, reviewId) {
    try {
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
        const response = await fetch(`/api/replies/${reviewId}`);
        
        if (!response.ok) {
            throw new Error('Failed to load replies');
        }
        
        const data = await response.json();
        
        // Get the container for this review's replies
        const reviewInput = document.querySelector(`input[value="${reviewId}"]`);
        if (!reviewInput) {
            console.error(`No input element found with reviewId ${reviewId}`);
            return;
        }
        const reviewElement = reviewInput.closest('.scroll-obj');
        const repliesContainer = reviewElement.querySelector('.review-replies');
        
        // Save the toggle button and form
        const toggleBtn = repliesContainer.querySelector('.reply-toggle-btn');
        const formContainer = repliesContainer.querySelector('.reply-form-container');
        
        // Clear existing replies
        repliesContainer.innerHTML = '';
        
        // Add each reply to the UI
        if (data.success && data.replies.length > 0) {
            data.replies.forEach(reply => {
                addReplyToUI(reviewId, reply, repliesContainer);
            });
        }
        
        // Add back the toggle button and form
        repliesContainer.appendChild(toggleBtn);
        repliesContainer.appendChild(formContainer);
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
    
    replyHTML += `
            <span class="reply-date">${reply.created_at}</span>
    `;
    
    if (reply.canDelete) {
        replyHTML += `
            <button class="delete-reply" data-id="${reply.reply_id}">🗑️</button>
        `;
    }
    
    replyHTML += `
        </div>
        <p>${reply.content}</p>
        <button class="reply-to-reply-btn" data-reply-id="${reply.reply_id}" data-review-id="${reviewId}">Reply</button>
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