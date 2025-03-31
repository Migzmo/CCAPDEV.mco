// public/js/utils/common.js
// Common utility functions used throughout the app

/**
 * Handles profile image loading errors
 */
function setupProfileImageErrorHandling() {
    const profileImages = document.querySelectorAll('.profile-pic');
    profileImages.forEach(img => {
        img.onerror = function() {
            this.src = '/images/profiles/default-profile.png';
        };
    });
}

/**
 * Checks if a user is logged in
 * @returns {Object|null} User object or null if not logged in
 */
function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem('currentUser'));
    } catch (e) {
        console.error('Error parsing current user:', e);
        return null;
    }
}

/**
 * Format a date for display
 * @param {Date|string} date Date to format
 * @returns {string} Formatted date string
 */
function formatDate(date) {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Run common setup tasks on page load
document.addEventListener('DOMContentLoaded', function() {
    setupProfileImageErrorHandling();
});

// Make utilities available globally
window.LaSapp = {
    getCurrentUser,
    formatDate
};