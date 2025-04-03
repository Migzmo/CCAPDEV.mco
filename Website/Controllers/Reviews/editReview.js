// Replace the entire file with this fixed version

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded for edit review functionality");
    
    // Setup for star rating in edit form
    let editSelectedRating = 0;
    
    function setupEditStarRating() {
        const editStars = document.querySelectorAll('#editReviewModal .star-rating .star');
        if (editStars.length > 0) {
            editStars.forEach(star => {
                star.addEventListener('click', function() {
                    editSelectedRating = parseInt(this.getAttribute('data-value'));
                    
                    // Update stars visual state
                    editStars.forEach(s => {
                        if (parseInt(s.getAttribute('data-value')) <= editSelectedRating) {
                            s.classList.add('selected');
                            s.classList.add('active'); // Add both classes for compatibility
                        } else {
                            s.classList.remove('selected');
                            s.classList.remove('active');
                        }
                    });
                    
                    // Update rating text
                    document.getElementById('edit-rating-text').textContent = editSelectedRating + ' out of 5';
                });
            });
        }
    }
    
    // Function to toggle the edit review modal
    window.toggleEditReviewModal = function() {
        const backdrop = document.getElementById('backdrop');
        const editReviewModal = document.getElementById('editReviewModal');
        
        if (editReviewModal && backdrop) {
            if (editReviewModal.style.display === 'block') {
                editReviewModal.style.display = 'none';
                backdrop.style.display = 'none';
            } else {
                editReviewModal.style.display = 'block';
                backdrop.style.display = 'block';
                setupEditStarRating();
            }
        } else {
            console.error('Edit review modal elements not found');
        }
    };
    
    // Function to open edit review modal with pre-populated data
    window.openEditReview = function(reviewId) {
        console.log("Opening edit review for ID:", reviewId);
        
        // Set the review ID
        document.getElementById('edit-review-id').value = reviewId;
        
        // Find the review element - try different selectors to be safe
        let reviewElement;
        try {
            // First try data-id selector
            reviewElement = document.querySelector(`.edit-review[data-id="${reviewId}"]`).closest('.scroll-obj');
        } catch (e) {
            try {
                // Then try ID selector
                reviewElement = document.querySelector(`#Edit-Review-${reviewId}`).closest('.scroll-obj');
            } catch (e2) {
                console.error("Could not find review element:", e2);
            }
        }
        
        // Fetch the review data to pre-populate the form
        fetch(`/api/reviews/${reviewId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Server responded with ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log("Review data:", data);
                
                // Pre-populate form fields
                document.getElementById('edit-review-content').value = data.review;
                
                // Set the initial rating
                editSelectedRating = data.rating || 0;
                const editStars = document.querySelectorAll('#editReviewModal .star-rating .star');
                editStars.forEach(star => {
                    if (parseInt(star.getAttribute('data-value')) <= editSelectedRating) {
                        star.classList.add('selected');
                        star.classList.add('active');
                    } else {
                        star.classList.remove('selected');
                        star.classList.remove('active');
                    }
                });
                
                if (document.getElementById('edit-rating-text')) {
                    document.getElementById('edit-rating-text').textContent = editSelectedRating + ' out of 5';
                }
                
                // Show the modal
                window.toggleEditReviewModal();
            })
            .catch(error => {
                console.error("Error fetching review data:", error);
                alert("Error loading review data: " + error.message);
            });
    };
    
    // Handle edit review form submission
    const editForm = document.forms['edit-review'];
    if (editForm) {
        editForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log("Edit review form submitted!");
            
            // Get review ID
            const reviewId = document.getElementById('edit-review-id').value;
            
            // Validate rating
            if (editSelectedRating === 0) {
                alert("Please select a rating");
                return;
            }
            
            // Get review content
            const reviewContent = document.getElementById('edit-review-content').value;
            if (!reviewContent.trim()) {
                alert("Please write a review");
                return;
            }
            
            // Create review data
            const reviewData = {
                review_id: reviewId,
                rating: editSelectedRating,
                review: reviewContent
            };
            
            console.log("Edit review data to be sent:", reviewData);
            
            // Disable submit button
            const submitButton = editForm.querySelector('input[type="submit"]');
            if (submitButton) submitButton.disabled = true;
            
            // Send data to server
            fetch('/api/reviews/edit', {
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
                console.log("Review updated successfully:", data);
                alert('Review updated successfully!');
                
                // Close modal
                window.toggleEditReviewModal();
                
                // Reload page to show the updated review
                window.location.reload();
            })
            .catch(error => {
                console.error('Error updating review:', error);
                alert('Failed to update review: ' + error.message);
            })
            .finally(() => {
                if (submitButton) submitButton.disabled = false;
            });
        });
    } else {
        console.error("Form with name 'edit-review' not found!");
    }
    
    // Handle star rating in the edit modal
    const editStars = document.querySelectorAll('#edit-star-rating .star');
    
    editStars.forEach(star => {
        star.addEventListener('click', function() {
            const value = parseInt(this.getAttribute('data-value'));
            
            // Clear all stars first
            editStars.forEach(s => {
                s.classList.remove('active');
                s.classList.remove('selected');
            });
            
            // Then set active stars up to the clicked one
            editStars.forEach(s => {
                if (parseInt(s.getAttribute('data-value')) <= value) {
                    s.classList.add('active');
                    s.classList.add('selected');
                }
            });
            
            // Update rating text
            document.getElementById('edit-rating-text').textContent = value + ' out of 5';
            
            // Set the rating value in a hidden field
            editSelectedRating = value;
            
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