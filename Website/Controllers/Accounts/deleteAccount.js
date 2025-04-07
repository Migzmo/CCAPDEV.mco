/**
 * Account Deletion Module
 * Handles user account deletion functionality
 */

import { resetLoginButton } from '../utils/authManager.js';

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
 * delete account's confirmation dialog
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


// Hides the delete account confirmation dialog
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

//confirm + process account deletion
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
            
            // Hide modals
            hideDeleteConfirmation();
            document.getElementById('editProfileFrame').style.display = 'none';
            document.getElementById('backdrop').style.display = 'none';

            // account delete -> reset login button
            resetLoginButton();

            alert('Your account has been deleted successfully.');

            // Redirect to home page after accoutn deletion
            window.location.href = '/';
        } else {
            throw new Error(result.error || 'Failed to delete account');
        }
    } catch (error) {
        console.error('Error deleting account:', error);
        alert('Failed to delete account: ' + error.message);
    }
}

// event handlers for account deletion
function setupDeleteAccountHandlers() {
    const deleteAccountBtn = document.getElementById('delete-account-btn');
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', showDeleteConfirmation);
    }

    // Confirmation dialog handlers
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