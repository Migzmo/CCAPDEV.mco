document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded, looking for form");
    const form = document.forms['create-review'];
    
    // Initialize selectedRating
    let selectedRating = 0;
    
    // Setup star rating functionality
    const stars = document.querySelectorAll('.star-rating .star');
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
            const reviewContent = document.getElementById('review-content').value;
            if (!reviewContent.trim()) {
                alert("Please write a review");
                return;
            }
            
            // Create review data
            const reviewData = {
                resto_id: resto_id,
                rating: selectedRating,
                review: reviewContent
            };
            
            console.log("Review data to be sent:", reviewData);
            
            // Disable submit button
            const submitButton = form.querySelector('input[type="submit"]');
            if (submitButton) submitButton.disabled = true;
            
            // Send data to server
            fetch('/api/addreview', {
                method: 'POST',
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
                console.log("Review submitted successfully:", data);
                alert('Review submitted successfully!');
                
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
        console.error("Form with name 'create-review' not found!");
    }
});