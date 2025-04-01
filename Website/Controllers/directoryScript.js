/**
 * Main directory script that handles UI interactions and initializes components
 */

import { 
    loginUser, 
    updateUIAfterLogin, 
    checkUserLoggedIn, 
    toggleUserDropdown 
} from './utils/authManager.js';

import { 
    togglePopupVisibility, 
    setupProfileTabs
} from './utils/utils.js';

import { 
    registerUser, 
    handleRegistration 
} from './Accounts/createAccount.js';

import { 
    toggleEditProfileFrame, 
    setupProfilePicPreview, 
    setupProfileUpdateHandler 
} from './Accounts/updateAccount.js';

import { 
    setupDeleteAccountHandlers 
} from './Accounts/deleteAccount.js';

// Wait for DOM to be fully loaded before attaching event handlers
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in on page load
    checkUserLoggedIn();
    
    // Set up profile tabs if on profile page
    setupProfileTabs();
    
    // Set up profile picture preview
    setupProfilePicPreview();
    
    // Set up profile update form handler
    setupProfileUpdateHandler();
    
    // Set up delete account handlers
    setupDeleteAccountHandlers();
    
    // Set up registration listeners
    setupRegistrationListeners();
    
    // Set up login listeners
    setupLoginListeners();
    
    // Debug check for reviews
    checkReviewsContent();
});

/**
 * Toggle the login popup visibility
 */
function togglePopup() {
    const loginFrame = document.getElementById('loginframe');
    const backdrop = document.getElementById('backdrop');
    const registerFrame = document.getElementById('registerframe');
    const isHidden = (loginFrame.style.display === 'none');

    loginFrame.style.display = isHidden ? 'block' : 'none';
    backdrop.style.display = isHidden ? 'block' : 'none';
    registerFrame.style.display = 'none';

    if (isHidden) {
        document.body.style.pointerEvents = 'none';
        loginFrame.style.pointerEvents = 'auto';
        backdrop.style.pointerEvents = 'auto';
    } else {
        document.body.style.pointerEvents = 'auto';
    }
}

/**
 * Setup registration-related event listeners
 */
function setupRegistrationListeners() {
    // Register button in login frame
    const registerBtn = document.getElementById('register');
    if (registerBtn) {
        registerBtn.addEventListener('click', function() {
            const loginFrame = document.getElementById('loginframe');
            const registerFrame = document.getElementById('registerframe');
            const backdrop = document.getElementById('backdrop');

            loginFrame.style.display = 'none';
            registerFrame.style.display = 'block';
            backdrop.style.display = 'block';

            document.body.style.pointerEvents = 'none';
            registerFrame.style.pointerEvents = 'auto';
            backdrop.style.pointerEvents = 'auto';
        });
    }
    
    // Close register frame button
    const closeRegisterBtn = document.getElementById('closeRegister');
    if (closeRegisterBtn) {
        closeRegisterBtn.addEventListener('click', function() {
            const registerFrame = document.getElementById('registerframe');
            const backdrop = document.getElementById('backdrop');

            registerFrame.style.display = 'none';
            backdrop.style.display = 'none';
            document.body.style.pointerEvents = 'auto';
        });
    }
    
    // Back to login button
    const backToLoginBtn = document.getElementById('backToLogin');
    if (backToLoginBtn) {
        backToLoginBtn.addEventListener('click', function() {
            const loginFrame = document.getElementById('loginframe');
            const registerFrame = document.getElementById('registerframe');

            registerFrame.style.display = 'none';
            loginFrame.style.display = 'block';

            document.body.style.pointerEvents = 'none';
            loginFrame.style.pointerEvents = 'auto';
        });
    }
    
    // Registration form
    const registrationForm = document.getElementById('registration-form');
    if (registrationForm) {
        // Remove all existing listeners by cloning and replacing
        const newForm = registrationForm.cloneNode(true);
        registrationForm.parentNode.replaceChild(newForm, registrationForm);

        // Add the event listener to the new form
        newForm.addEventListener('submit', handleRegistration);
    }
}

/**
 * Setup login-related event listeners
 */
function setupLoginListeners() {
    // Signin button
    const signinBtn = document.querySelector('.signin-button');
    if (signinBtn) {
        signinBtn.addEventListener('click', function() {
            const loginFrame = document.getElementById('loginframe');
            const signinFrame = document.getElementById('signinframe');
            const backdrop = document.getElementById('backdrop');

            loginFrame.style.display = 'none';
            signinFrame.style.display = 'block';
            backdrop.style.display = 'block';

            document.body.style.pointerEvents = 'none';
            signinFrame.style.pointerEvents = 'auto';
            backdrop.style.pointerEvents = 'auto';
        });
    }
    
    // Close signin frame button
    const closeSigninBtn = document.getElementById('closeSignin');
    if (closeSigninBtn) {
        closeSigninBtn.addEventListener('click', function() {
            const signinFrame = document.getElementById('signinframe');
            const backdrop = document.getElementById('backdrop');
            
            signinFrame.style.display = 'none';
            backdrop.style.display = 'none';
            document.body.style.pointerEvents = 'auto';
        });
    }
    
    // Back to options button
    const backToOptionsBtn = document.getElementById('backToOptions');
    if (backToOptionsBtn) {
        backToOptionsBtn.addEventListener('click', function() {
            const signinFrame = document.getElementById('signinframe');
            const loginFrame = document.getElementById('loginframe');
            
            signinFrame.style.display = 'none';
            loginFrame.style.display = 'block';
            
            document.body.style.pointerEvents = 'none';
            loginFrame.style.pointerEvents = 'auto';
        });
    }
    
    // Signin form
    const signinForm = document.querySelector('.signin-form');
    if (signinForm) {
        signinForm.addEventListener('submit', async function(event) {
            event.preventDefault();

            const formData = {
                username: document.getElementById('signin-username').value,
                password: document.getElementById('signin-password').value
            };

            const result = await loginUser(formData);
            
            if (result.success) {
                // Update UI
                updateUIAfterLogin();
                
                // Clear form fields
                document.getElementById('signin-username').value = '';
                document.getElementById('signin-password').value = '';
                
                // Close the signin popup
                document.getElementById('signinframe').style.display = 'none';
                document.getElementById('backdrop').style.display = 'none';
                document.body.style.pointerEvents = 'auto';
                
                alert('Logged in successfully!');
            } else {
                alert(result.error);
            }
        });
    }
}

/**
 * Check for reviews content (debug)
 */
function checkReviewsContent() {
    const reviewsContent = document.getElementById('reviews-content');
    if (reviewsContent) {
        console.log('Reviews content found');
        console.log('Reviews HTML:', reviewsContent.innerHTML);
        const reviewsItems = reviewsContent.querySelectorAll('.review-card');
        console.log(`Found ${reviewsItems.length} review cards`);
    }
}

/**
 * Toggle popup for creating a restaurant
 */
function togglePopupCreateResto() {
    const popup = document.getElementById('createRestoFrame');
    const backdrop = document.getElementById('backdrop');
    const isHidden = (popup.style.display === 'none');
    
    popup.style.display = isHidden ? 'block' : 'none';
    backdrop.style.display = isHidden ? 'block' : 'none';

    if (isHidden) {
        document.body.style.pointerEvents = 'none';
        popup.style.pointerEvents = 'auto';
    } else {
        document.body.style.pointerEvents = 'auto';
    }
}

/**
 * Toggle delete restaurant confirmation popup
 */
function toggleDeleteConfirm() {
    const popup = document.getElementById('deleteConfirmPopup');
    const backdrop = document.getElementById('backdrop');
    const isHidden = (popup.style.display === 'none' || popup.style.display === '');
    
    popup.style.display = isHidden ? 'block' : 'none';
    backdrop.style.display = isHidden ? 'block' : 'none';

    if (isHidden) {
        document.body.style.pointerEvents = 'none';
        popup.style.pointerEvents = 'auto';
        backdrop.style.pointerEvents = 'auto';
    } else {
        document.body.style.pointerEvents = 'auto';
    }
}

/**
 * Toggle the review modal
 */
function toggleReviewModal() {
    const backdrop = document.getElementById('backdrop');
    const reviewModal = document.getElementById('reviewModal');
    
    if (reviewModal.style.display === 'block') {
        reviewModal.style.display = 'none';
        backdrop.style.display = 'none';
    } else {
        reviewModal.style.display = 'block';
        backdrop.style.display = 'block';
    }
}

// Make functions globally accessible
window.togglePopup = togglePopup;
window.toggleEditProfileFrame = toggleEditProfileFrame;
window.togglePopupCreateResto = togglePopupCreateResto;
window.toggleDeleteConfirm = toggleDeleteConfirm;
window.toggleReviewModal = toggleReviewModal;