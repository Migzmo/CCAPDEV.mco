/**
 * Account Update Module
 * Handles updating user profile information
 */

import { showProfilePicPreview } from '../utils/utils.js';

async function fetchUserProfile(userId) {
    try {
        const response = await fetch(`/api/users/api/${userId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch profile');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching profile:', error);
        return { error: error.message };
    }
}

//Update profile
async function updateUserProfile(formData) {
    try {
        const response = await fetch('/api/users/update-profile', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Update failed');
        }

        return await response.json();
    } catch (error) {
        console.error('Error updating profile:', error);
        return { success: false, error: error.message };
    }
}

//visibility toggle
function toggleEditProfileFrame() {
    const editProfileFrame = document.getElementById('editProfileFrame');
    const backdrop = document.getElementById('backdrop');

    if (editProfileFrame.style.display === 'none' || !editProfileFrame.style.display) {
        // Get current user data for form population
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));

        if (!currentUser || !currentUser.userId) {
            alert("You must be logged in to edit your profile");
            return;
        }

        fetch(`/api/users/api/${currentUser.userId}`)
            .then(response => {
                if (!response.ok) {
                    console.error(`Failed to fetch profile (status ${response.status})`);
                    throw new Error(`Failed to fetch profile (status ${response.status})`);
                }
                
                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    console.error('Response is not JSON:', contentType);
                    throw new Error('Server returned non-JSON response');
                }
                
                return response.json();
            })
            .then(userData => {
                console.log("User data retrieved:", userData);
                document.getElementById('edit-username').value = userData.acc_name || '';
                document.getElementById('edit-bio').value = userData.acc_bio || '';

                // display profile picture
                const previewDiv = document.getElementById('profile-pic-preview');
                if (userData.profile_pic) {
                    previewDiv.style.backgroundImage = `url('${userData.profile_pic}')`;
                } else {
                    // default image path
                    previewDiv.style.backgroundImage = `url('/views/images/profilePictures/default-profile.png')`;
                }

                // form display
                editProfileFrame.style.display = 'block';
                backdrop.style.display = 'block';
            })
            .catch(error => {
                console.error('Error fetching user data:', error);
                alert('Failed to load profile data. Please try again.');
            });
    } else {
        editProfileFrame.style.display = 'none';
        backdrop.style.display = 'none';
    }
}

// profile pic preview
function setupProfilePicPreview() {
    const profilePicInput = document.getElementById('edit-profile-pic');
    const previewElement = document.getElementById('profile-pic-preview');
    
    if (profilePicInput) {
        profilePicInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    previewElement.style.backgroundImage = `url('${e.target.result}')`;
                    previewElement.removeAttribute('empty');
                    previewElement.classList.remove('empty');
                };
                
                reader.readAsDataURL(e.target.files[0]);
            }
        });
    }
}

function setupProfileUpdateHandler() {
    const editProfileForm = document.getElementById('edit-profile-form');

    if (editProfileForm) {
        editProfileForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (!currentUser) {
                alert("You must be logged in to update your profile");
                return;
            }

            const formData = new FormData(this);
            formData.append('userId', currentUser.userId);

            // debugging thing
            console.log('User ID being sent:', currentUser.userId);
            for (let pair of formData.entries()) {
                console.log(pair[0] + ': ' + pair[1]);
            }

            const result = await updateUserProfile(formData);

            if (result.success) {
                alert('Profile updated successfully!');
                toggleEditProfileFrame();
                window.location.reload();
            } else {
                alert(result.error || 'Update failed');
            }
        });
    }
}

// Export functions
export {
    fetchUserProfile,
    updateUserProfile,
    toggleEditProfileFrame,
    setupProfilePicPreview,
    setupProfileUpdateHandler
};