// public/js/restaurant/addReview.js
import { getCurrentUser, isLoggedIn } from '../modules/auth.js';

document.addEventListener('DOMContentLoaded', function() {
    const reviewForm = document.getElementById('review-form');
    
    if (reviewForm) {
        reviewForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (!isLoggedIn()) {
                alert('Please log in to submit a review');
                return;
            }
            
            // Rest of the review submission code...
        });
    }
});