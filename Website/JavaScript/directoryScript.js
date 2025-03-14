    document.getElementById('register').addEventListener('click', function() {
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

    // Modify the profile update submission handler in directoryScript.js
    // Modify the profile update submission handler
    document.addEventListener('DOMContentLoaded', function() {
      const editProfileForm = document.getElementById('edit-profile-form');

      if (editProfileForm) {
        editProfileForm.addEventListener('submit', async function(e) {
          e.preventDefault();

          // Get current user data and validate session
          const currentUser = JSON.parse(localStorage.getItem('currentUser'));

          if (!currentUser || !currentUser.userId) {
            alert('Session expired. Please log in again.');
            // Redirect to login or toggle login frame
            togglePopup();
            return;
          }

          const formData = new FormData(this);

          // Add userId to form data and ensure it's a string
          formData.append('userId', String(currentUser.userId));

          // Debug log
          console.log('Sending profile update with userId:', currentUser.userId);
          for (let pair of formData.entries()) {
            console.log(pair[0] + ':', pair[1]);
          }

          try {
            const response = await fetch('/api/users/update-profile', {
              method: 'POST',
              body: formData
            });

            const data = await response.json();

            if (!response.ok) {
              throw new Error(data.message || 'Update failed');
            }

            if (data.success) {
              alert('Profile updated successfully!');
              toggleEditProfileFrame();
            } else {
              throw new Error(data.message || 'Update failed');
            }
          } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile: ' + error.message);
          }
        });
      }

      // Add listener for profile picture input
      const profilePicInput = document.getElementById('edit-profile-pic');
      if (profilePicInput) {
        profilePicInput.addEventListener('change', function(e) {
          if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
              const preview = document.getElementById('profile-pic-preview');
              preview.style.backgroundImage = `url(${e.target.result})`;
            };
            reader.readAsDataURL(e.target.files[0]);
          }
        });
      }
    });

    // Function to handle user dropdown
    function toggleUserDropdown(userBtn) {
      const existingDropdown = document.querySelector('.user-dropdown');

      if (existingDropdown) {
        existingDropdown.remove();
        return;
      }

      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      const menu = document.createElement('div');
      menu.className = 'user-dropdown';
      menu.innerHTML = `
        <a href="/profile/${currentUser.userId}">View Profile</a>
        <a href="#" id="editProfileBtn">Edit Profile</a>
        <a href="#" id="logoutBtn">Logout</a>
      `;

      // Position the dropdown
      const rect = userBtn.getBoundingClientRect();
      menu.style.position = 'absolute';
      menu.style.top = `${rect.bottom}px`;
      menu.style.right = '40px';
      menu.style.backgroundColor = '#FFFFFF';
      menu.style.border = '1px solid #DDF0DE';
      menu.style.borderRadius = '5px';
      menu.style.padding = '10px';
      menu.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
      menu.style.zIndex = '1001';

      document.body.appendChild(menu);

      // Add event listeners
      document.getElementById('editProfileBtn').addEventListener('click', function() {
        toggleEditProfileFrame();
      });

      document.getElementById('logoutBtn').addEventListener('click', function() {
        localStorage.removeItem('currentUser');
        location.reload();
      });
    }

    // Also add to login success handlers
    function updateUIAfterLogin() {
        const userBtn = document.getElementById('loginButton');
        userBtn.textContent = 'USER PROFILE';
        userBtn.removeAttribute('onclick');

        userBtn.addEventListener('click', function(e) {
            e.preventDefault();
            toggleUserDropdown(userBtn);  // Pass the button reference
        });
    }

    document.addEventListener('DOMContentLoaded', function() {
      const signinForm = document.querySelector('.signin-form');

      if (signinForm) {
        signinForm.addEventListener('submit', function(event) {
          event.preventDefault();

          const formData = {
            username: document.getElementById('signin-username').value,
            password: document.getElementById('signin-password').value
          };

          fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
          })
          .then(response => {
            if (!response.ok) {
              return response.json().then(data => {
                throw new Error(data.message || 'Login failed');
              });
            }
            return response.json();
          })
          .then(data => {
            if (data.success) {
              // Store user data in localStorage
              localStorage.setItem('currentUser', JSON.stringify({
                username: data.username,
                userId: data.userId,
                accountType: data.accountType
              }));

              // Update UI
              updateUIAfterLogin();

              // Close the signin popup
              document.getElementById('signinframe').style.display = 'none';
              document.getElementById('backdrop').style.display = 'none';
              document.body.style.pointerEvents = 'auto';

              alert('Logged in successfully!');

              // Refresh the page or redirect if needed
              // window.location.reload();
            }
          })
          .catch(error => {
            alert(error.message);
            console.error('Login error:', error);
          });
        });
      }
    });

    async function handleSignin(event) {
      event.preventDefault();
      console.log('Signin form submitted');

      const formData = {
        username: document.getElementById('signin-username').value,
        password: document.getElementById('signin-password').value
      };

      console.log('Sending login data:', formData);

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || `Server responded with ${response.status}`);
        }

        const data = await response.json();
        if (data.success) {
          // Store the user session info
          localStorage.setItem('currentUser', JSON.stringify({
            username: data.username,
            userId: data.userId
          }));

          updateUIAfterLogin()

          // Clear form fields
          document.getElementById('signin-username').value = '';
          document.getElementById('signin-password').value = '';

          // Close the signin popup
          document.getElementById('signinframe').style.display = 'none';
          document.getElementById('backdrop').style.display = 'none';

          // Reset body pointer events
          document.body.style.pointerEvents = 'auto';

          alert('Signed in successfully!');
        } else {
          throw new Error(data.message);
        }
      } catch (error) {
        alert(`Login failed: ${error.message}`);
        console.error('Login error:', error);
      }
    }

    // Add this function to check if user is already logged in
    function checkUserLoggedIn() {
      const currentUser = localStorage.getItem('currentUser');
      if (currentUser) {
        document.getElementById('loginButton').textContent = 'USER PROFILE';
      }
    }

    document.addEventListener('DOMContentLoaded', function() {
        document.getElementById('closeRegister').addEventListener('click', function() {
            const registerFrame = document.getElementById('registerframe');
            const backdrop = document.getElementById('backdrop');

            registerFrame.style.display = 'none';
            backdrop.style.display = 'none';
            document.body.style.pointerEvents = 'auto';
        });

        document.getElementById('backToLogin').addEventListener('click', function() {
            const loginFrame = document.getElementById('loginframe');
            const registerFrame = document.getElementById('registerframe');

            registerFrame.style.display = 'none';
            loginFrame.style.display = 'block';

            document.body.style.pointerEvents = 'none';
            loginFrame.style.pointerEvents = 'auto';
        });
    });

    document.addEventListener('DOMContentLoaded', function() {
        const registrationForm = document.getElementById('registration-form');

        if (registrationForm) {
            // Remove all existing listeners by cloning and replacing
            const newForm = registrationForm.cloneNode(true);
            registrationForm.parentNode.replaceChild(newForm, registrationForm);

            // Add the event listener to the new form
            newForm.addEventListener('submit', function(event) {
                event.preventDefault();
                handleRegistration(event);
            });
        }
    });

    async function handleRegistration(event) {
        event.preventDefault();
        console.log('Registration form submitted');

        const formData = {
            username: document.getElementById('username').value,
            password: document.getElementById('password').value,
            description: document.getElementById('description').value,
            profilePic: '' // You can add file handling later
        };

        console.log('Sending data:', formData);

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || `Server responded with ${response.status}`);
            }

            const data = await response.json();
            if (data.success) {
                // Clear form fields
                document.getElementById('username').value = '';
                document.getElementById('password').value = '';
                document.getElementById('description').value = '';
                if (document.getElementById('avatar')) {
                    document.getElementById('avatar').value = '';
                }

                // Store the user session info
                localStorage.setItem('currentUser', JSON.stringify({
                    username: data.username,
                    userId: data.userId,
                    accountType: data.accountType
                }));

                // Update UI - call the function that also sets up the event listener
                updateUIAfterLogin();

                // Close all popups
                document.getElementById('registerframe').style.display = 'none';
                document.getElementById('backdrop').style.display = 'none';

                // Reset body pointer events
                document.body.style.pointerEvents = 'auto';

                alert('Account created successfully!');
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            alert(`Registration failed: ${error.message}`);
            console.error('Registration error:', error);
        }
    }

document.getElementById('closeRegister').addEventListener('click', function() {
    const registerFrame = document.getElementById('registerframe');
    const backdrop = document.getElementById('backdrop');

    registerFrame.style.display = 'none';
    backdrop.style.display = 'none';
    document.body.style.pointerEvents = 'auto';
});

document.querySelector('.signin-button').addEventListener('click', function() {
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

// Toggle Edit Profile modal
function toggleEditProfileFrame() {
        const editProfileFrame = document.getElementById('editProfileFrame');
        const backdrop = document.getElementById('backdrop');

        if (editProfileFrame.style.display === 'none' || !editProfileFrame.style.display) {
            // Get current user data to pre-populate the form
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));

            if (!currentUser) {
                alert("You must be logged in to edit your profile");
                return;
            }

            // Fetch user data to populate the form
            fetch(`/api/users/${currentUser.userId}`)
                .then(response => response.json())
                .then(userData => {
                    document.getElementById('edit-username').value = userData.acc_name || '';
                    document.getElementById('edit-bio').value = userData.acc_bio || '';

                    // Show profile picture if available
                    if (userData.profile_pic) {
                        const previewDiv = document.getElementById('profile-pic-preview');
                        previewDiv.style.backgroundImage = `url('${userData.profile_pic}')`;
                    }

                    // Display the form
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

// Fetch user profile data
async function fetchUserProfile(userId) {
    try {
        const response = await fetch(`/api/users/${userId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch profile');
        }

        const userData = await response.json();

        // Populate form fields
        document.getElementById('edit-username').value = userData.acc_name || '';
        document.getElementById('edit-bio').value = userData.acc_bio || '';

        // Show profile image preview if available
        const previewDiv = document.getElementById('profile-pic-preview');
        if (userData.profile_pic) {
            previewDiv.style.backgroundImage = `url(${userData.profile_pic})`;
        }

    } catch (error) {
        console.error('Error fetching profile:', error);
    }
}

// Handle profile pic preview
// Profile form submission handler
document.addEventListener('DOMContentLoaded', function() {
  const editProfileForm = document.getElementById('edit-profile-form');

  if (editProfileForm) {
    editProfileForm.addEventListener('submit', function(e) {
      e.preventDefault();

      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (!currentUser) {
        alert("You must be logged in to update your profile");
        return;
      }

      const formData = new FormData(this);

      // Add the user ID to the form data
      formData.append('userId', currentUser.userId);

      // Log form data for debugging
      console.log('User ID being sent:', currentUser.userId);
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      fetch('/api/users/update-profile', {
        method: 'POST',
        body: formData
      })
      .then(response => {
        if (!response.ok) {
          return response.json().then(err => { throw err; });
        }
        return response.json();
      })
      .then(data => {
        if (data.success) {
          alert('Profile updated successfully!');
          toggleEditProfileFrame();
        } else {
          alert(data.message || 'Update failed');
        }
      })
      .catch(error => {
        console.error('Error updating profile:', error);
        alert('Failed to update profile: ' + (error.message || 'Please try again.'));
      });
    });
  }
});