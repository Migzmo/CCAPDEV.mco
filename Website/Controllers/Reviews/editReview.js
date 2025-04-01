document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded, looking for form");
    const form = document.forms['edit-review'];
    
    
    let selectedRating = 0;
    
    // Sadly dos not work and also dont know what to use it for yet
    const stars = document.querySelectorAll('#edit-star-rating .star');
    stars.forEach(star => {
        star.addEventListener('click', function() {
            selectedRating = parseInt(this.getAttribute('data-value'));
            
            // Update stars visual state
            stars.forEach(s => {
                if (parseInt(s.getAttribute('data-value')) <= selectedRating) {
                    s.classList.add('selected');
                } else {
                    s.classList.remove('selected');
                }
            });
            
            // Update rating text
            document.getElementById('rating-text').textContent = selectedRating + ' out of 5';
        });
    });
    
    if (form) {
        // FIXED: Changed 'submitReview' to 'submit'
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log("Review form submitted!");
            
            // Get restaurant ID from URL
            const pathSegments = window.location.pathname.split('/');
            const resto_id = pathSegments[pathSegments.length - 1];
            
            // Validate rating
            if (selectedRating === 0) {
                alert("Please select a rating");
                return;
            }
            
            // Get review content
           
            const reviewContent = document.getElementById('edit-review-content').value;
            if (!reviewContent.trim()) {
                alert("Please write a review");
                return;
            }
            const review_id = document.getElementById('hidden-review-id').value;
            // Create review data
            const reviewData = {
                review_id: review_id,
                resto_id: resto_id,
                rating: selectedRating,
                review: reviewContent
            };
            
            console.log("Review data to be sent:", reviewData);
            
            // Disable submit button
            const submitButton = form.querySelector('input[type="submit"]');
            if (submitButton) submitButton.disabled = true;
            
            // Send data to server
            fetch('/api/editreview', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reviewData)
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => {
                        throw new Error(err.message || 'Server error');
                    });
                }
                return response.json();
            })
            .then(data => {
                console.log("Review Edited successfully:", data);
                alert('Review Edited successfully!');
                
                // Close modal
                if (typeof toggleReviewModal === 'function') {
                    toggleReviewModal();
                }
                
                // Reload page to show the new review
                window.location.reload();
            })
            .catch(error => {
                console.error('Error submitting review:', error);
                alert('Failed to submit review: ' + error.message);
            })
            .finally(() => {
                if (submitButton) submitButton.disabled = false;
            });
        });
    } else {
        console.error("Form with name 'edit-review' not found!");
    }
});

// Function to toggle the edit review modal visibility
function toggleEditReviewModal() {
    const modal = document.getElementById('editReviewModal');
    const backdrop = document.getElementById('backdrop');
    
    if (modal.style.display === 'block') {
        modal.style.display = 'none';
        backdrop.style.display = 'none';
    } else {
        modal.style.display = 'block';
        backdrop.style.display = 'block';
    }
}

// Function to open edit review modal with existing review data
function openEditReview(reviewId) {
    console.log("Opening edit for review:", reviewId);
    
    // Find the review element
    const reviewElement = document.querySelector(`#Edit-Review-${reviewId}`).closest('.scroll-obj');
    
    // Get the review text
    const reviewText = reviewElement.querySelector('p').textContent;
    
    // Set the review ID in the hidden input
    document.getElementById('edit-review-id').value = reviewId;
    
    // Set the review content in textarea
    document.getElementById('edit-review-content').value = reviewText;
    
    // Show the modal and backdrop
    document.getElementById('editReviewModal').style.display = 'block';
    document.getElementById('backdrop').style.display = 'block';
}

// Initialize star rating when document is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Handle star rating in the edit modal
    const editStars = document.querySelectorAll('#edit-star-rating .star');
    
    editStars.forEach(star => {
        star.addEventListener('click', function() {
            const value = parseInt(this.getAttribute('data-value'));
            
            // Clear all stars first
            editStars.forEach(s => s.classList.remove('active'));
            
            // Then set active stars up to the clicked one
            editStars.forEach(s => {
                if (parseInt(s.getAttribute('data-value')) <= value) {
                    s.classList.add('active');
                }
            });
            
            // Update rating text
            document.getElementById('edit-rating-text').textContent = value + ' out of 5';
            
            // Add hidden rating input field if it doesn't exist
            let ratingInput = document.querySelector('form[name="edit-review"] input[name="rating"]');
            if (!ratingInput) {
                ratingInput = document.createElement('input');
                ratingInput.type = 'hidden';
                ratingInput.name = 'rating';
                document.forms['edit-review'].appendChild(ratingInput);
            }
            
            // Set the rating value
            ratingInput.value = value;
        });
    });
});