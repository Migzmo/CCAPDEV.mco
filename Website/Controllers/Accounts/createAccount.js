/**
 * Account Creation Module
 * Handles user registration and profile setup
 */

import { updateUIAfterLogin } from '../utils/authManager.js';

/**
 * Handle the user registration form submission
 * @param {Event} event - Form submission event
 */
async function handleRegistration(event) {
    event.preventDefault();
    console.log('Registration form submitted');
    
    // Create a FormData object to properly handle file uploads
    const formData = new FormData();
    
    // Add text data to FormData
    formData.append('username', document.getElementById('username').value);
    formData.append('password', document.getElementById('password').value);
    formData.append('accountType', document.querySelector('input[name="accountType"]:checked').value);
    formData.append('description', document.getElementById('description').value);
    
    // Add the profile picture file if one was selected
    const avatarInput = document.getElementById('avatar');
    if (avatarInput && avatarInput.files && avatarInput.files[0]) {
        formData.append('profile_pic', avatarInput.files[0]);
    }
    
    const result = await registerUser(formData);
    
    if (result.success) {
        // Store the user session info
        localStorage.setItem('currentUser', JSON.stringify({
            username: result.data.username,
            userId: result.data.userId,
            accountType: result.data.accountType
        }));

        // Update UI
        updateUIAfterLogin();
        
        // Clear form fields
        document.getElementById('registration-form').reset();

        // Close all popups
        document.getElementById('registerframe').style.display = 'none';
        document.getElementById('backdrop').style.display = 'none';

        // Reset body pointer events
        document.body.style.pointerEvents = 'auto';

        alert('Account created successfully!');
        
        // Reload the page to reflect changes
        window.location.href = '/';
    } else {
        alert(`Registration failed: ${result.error}`);
    }
}

/**
 * Register a new user
 * @param {FormData} formData - Form data for registration including file uploads
 * @returns {Promise<Object>} - Response from the server
 */
async function registerUser(formData) {
    try {
        console.log('Sending registration data with FormData');
        
        // Log form data for debugging (optional)
        for (let pair of formData.entries()) {
            console.log(pair[0] + ': ' + (pair[0] === 'profile_pic' ? 'File data' : pair[1]));
        }

        const response = await fetch('/api/auth/register', {
            method: 'POST',
            body: formData
        });

        console.log('Registration response status:', response.status);
        
        // Log raw response for debugging
        const responseText = await response.text();
        console.log('Registration response text:', responseText);
        
        // Parse the response as JSON (if possible)
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            throw new Error('Server returned invalid JSON: ' + responseText);
        }
        
        if (data.success) {
            return { success: true, data };
        } else {
            throw new Error(data.message || 'Registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        return { success: false, error: error.message };
    }
}

// Export functions
export { registerUser, handleRegistration };