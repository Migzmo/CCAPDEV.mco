/**
 * Account Deletion Module
 * Handles user account deletion functionality
 */

import { resetLoginButton } from '../utils/authManager.js';

/**
 * Delete a user account using the API
 * @param {string|number} userId - The user ID to delete
 * @returns {Promise<Object>} - Response from the server
 */
async function deleteUserAccount(userId) {
    try {
        const response = await fetch('/api/users/delete-account', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId })
        });
        
        console.log('Delete account response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Server error:', errorText);
            throw new Error(`Server returned ${response.status}: ${errorText || 'Unknown error'}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error deleting account:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Show the delete account confirmation dialog
 */
function showDeleteConfirmation() {
    const deleteConfirmDialog = document.getElementById('deleteAccountConfirm');
    const backdrop = document.getElementById('backdrop');

    if (deleteConfirmDialog) {
        deleteConfirmDialog.style.display = 'block';
    }

    if (backdrop) {
        backdrop.style.display = 'block';
    }
}

/**
 * Hide the delete account confirmation dialog
 */
function hideDeleteConfirmation() {
    const deleteConfirmDialog = document.getElementById('deleteAccountConfirm');
    const backdrop = document.getElementById('backdrop');

    if (deleteConfirmDialog) {
        deleteConfirmDialog.style.display = 'none';
    }

    if (backdrop && document.getElementById('editProfileFrame').style.display !== 'block') {
        backdrop.style.display = 'none';
    }
}

/**
 * Confirm and process account deletion
 */
async function confirmDeleteAccount() {
    try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser || !currentUser.userId) {
            alert('Session expired. Please log in again.');
            return;
        }

        const result = await deleteUserAccount(currentUser.userId);
        
        if (result.success) {
            // Clear user data from localStorage
            localStorage.removeItem('currentUser');
            
            // Hide all modals
            hideDeleteConfirmation();
            document.getElementById('editProfileFrame').style.display = 'none';
            document.getElementById('backdrop').style.display = 'none';

            // Reset login button
            resetLoginButton();

            // Show success message
            alert('Your account has been deleted successfully.');

            // Redirect to home page
            window.location.href = '/';
        } else {
            throw new Error(result.error || 'Failed to delete account');
        }
    } catch (error) {
        console.error('Error deleting account:', error);
        alert('Failed to delete account: ' + error.message);
    }
}

/**
 * Set up account deletion event handlers
 */
function setupDeleteAccountHandlers() {
    // Set up delete account button handler
    const deleteAccountBtn = document.getElementById('delete-account-btn');
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', showDeleteConfirmation);
    }

    // Set up confirmation dialog handlers
    const confirmDeleteBtn = document.getElementById('confirmDeleteAccount');
    const cancelDeleteBtn = document.getElementById('cancelDeleteAccount');

    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', confirmDeleteAccount);
    }

    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener('click', hideDeleteConfirmation);
    }
}

// Export functions
export {
    deleteUserAccount,
    showDeleteConfirmation,
    hideDeleteConfirmation,
    confirmDeleteAccount,
    setupDeleteAccountHandlers
};