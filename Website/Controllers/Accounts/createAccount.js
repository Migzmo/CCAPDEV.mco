/**
 * Account Creation Module
 * Handles user registration and profile setup
 */

import { updateUIAfterLogin } from '../utils/authManager.js';

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} - Response from the server
 */
async function registerUser(userData) {
    try {
        console.log('Sending registration data:', userData);

        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        console.log('Registration response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `Server responded with ${response.status}`);
        }

        const data = await response.json();
        if (data.success) {
            // Store the user session info
            localStorage.setItem('currentUser', JSON.stringify({
                username: data.username,
                userId: data.userId,
                accountType: data.accountType
            }));

            // Update UI
            updateUIAfterLogin();
             // Reload the page to reflect changes
             window.location.href = '/';
            return { success: true, data };
        } else {
            throw new Error(data.message || 'Registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Handle the user registration form submission
 * @param {Event} event - Form submission event
 */
async function handleRegistration(event) {
    event.preventDefault();
    console.log('Registration form submitted');
    const selectedAccountType = document.querySelector('input[name="accountType"]:checked').value;
    console.log(selectedAccountType); // Will be "User" or "business-owner"
    const formData = {
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
        description: document.getElementById('description').value,
        accountType: selectedAccountType,
        profilePic: '' // You can add file handling later
    };

    const result = await registerUser(formData);
    
    if (result.success) {
        // Clear form fields
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        document.getElementById('description').value = '';
        if (document.getElementById('avatar')) {
            document.getElementById('avatar').value = '';
        }

        // Close all popups
        document.getElementById('registerframe').style.display = 'none';
        document.getElementById('backdrop').style.display = 'none';

        // Reset body pointer events
        document.body.style.pointerEvents = 'auto';

        alert('Account created successfully!');
    } else {
        alert(`Registration failed: ${result.error}`);
    }
}

// Export functions
export { registerUser, handleRegistration };