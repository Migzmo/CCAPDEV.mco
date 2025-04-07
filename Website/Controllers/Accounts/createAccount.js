/**
 * ACCOUNT CREATION
 * This file handles the process from forms to session info, and such.
 * It then exports the necessary modules
 */

import { updateUIAfterLogin } from '../utils/authManager.js';

//handleRegistration
async function handleRegistration(event) {
    event.preventDefault();
    console.log('Registration form submitted');
    
    // formData prep
    const formData = new FormData();
    
    // textfields
    formData.append('username', document.getElementById('username').value);
    formData.append('password', document.getElementById('password').value);
    formData.append('accountType', document.querySelector('input[name="accountType"]:checked').value);
    formData.append('description', document.getElementById('description').value);
    
    // profile pic
    const avatarInput = document.getElementById('avatar');
    if (avatarInput && avatarInput.files && avatarInput.files[0]) {
        formData.append('profile_pic', avatarInput.files[0]);
    }
    
    const result = await registerUser(formData);
    
    if (result.success) {
        // Store user session info
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
        
        // Reload page to reflect changes
        window.location.href = '/';
    } else {
        alert(`Registration failed: Account Already Exists`);
    }
}

// registerUser func
async function registerUser(formData) {
    try {
        console.log('Sending registration data with FormData');
        
        // debugging
        for (let pair of formData.entries()) {
            console.log(pair[0] + ': ' + (pair[0] === 'profile_pic' ? 'File data' : pair[1]));
        }

        const response = await fetch('/api/auth/register', {
            method: 'POST',
            body: formData
        });

        console.log('Registration response status:', response.status);
        
        // for debugging
        const responseText = await response.text();
        console.log('Registration response text:', responseText);
        
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