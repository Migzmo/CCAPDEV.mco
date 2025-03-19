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
    
        // Remove existing dropdown if it exists
        if (existingDropdown) {
            existingDropdown.remove();
            return;
        }
    
        // Get current user data from localStorage
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            console.error('No user data found');
            return;
        }
    
        // Create dropdown menu
        const menu = document.createElement('div');
        menu.className = 'user-dropdown';
        menu.innerHTML = `
            <a href="/profile/${currentUser.userId}">View Profile</a>
            <a href="#" id="editProfileBtn">Edit Profile</a>
            <a href="#" id="logoutBtn">Logout</a>
        `;
    
        // Get positioning information
        const rect = userBtn.getBoundingClientRect();
        const navbar = document.querySelector('.navbar');
        const navbarHeight = navbar.offsetHeight;
    
        // Apply styles for positioning with overlap - align with button
        menu.style.position = 'fixed'; // Use fixed positioning
        menu.style.top = `${navbarHeight - 10}px`; // Create 10px overlap with navbar
        
        // Position from the left to align with button
        menu.style.left = `${rect.left}px`;
        menu.style.width = `${rect.width}px`; // Match button width
        
        // Styling
        menu.style.backgroundColor = '#FFFFFF';
        menu.style.border = '1px solid #DDF0DE';
        menu.style.borderTop = '3px solid #2E7D32'; // Green top border for visual connection
        menu.style.borderRadius = '5px';
        menu.style.padding = '10px';
        menu.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
        menu.style.zIndex = '10001'; // Make sure it's above navbar (which is 10000)
    
        // Append to document
        document.body.appendChild(menu);
    
        // Add event listeners
        document.getElementById('editProfileBtn').addEventListener('click', function() {
            toggleEditProfileFrame();
            menu.remove(); // Remove dropdown after clicking
        });
    
        document.getElementById('logoutBtn').addEventListener('click', function() {
            localStorage.removeItem('currentUser');
            location.reload();
        });
    
        // Close dropdown when clicking outside
        document.addEventListener('click', function closeDropdown(e) {
            if (!menu.contains(e.target) && e.target !== userBtn) {
                menu.remove();
                document.removeEventListener('click', closeDropdown);
            }
        });
    
        // Update dropdown position on window resize
        window.addEventListener('resize', function updatePosition() {
            const updatedRect = userBtn.getBoundingClientRect();
            menu.style.left = `${updatedRect.left}px`;
            menu.style.width = `${updatedRect.width}px`;
        });
    }
  
    // login success - helper function 
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

    // Improved function to check if user is logged in
    function checkUserLoggedIn() {
        const currentUserString = localStorage.getItem('currentUser');
        if (currentUserString) {
            try {
                const currentUser = JSON.parse(currentUserString);
                if (currentUser && currentUser.userId) {
                    // Valid user data exists
                    updateUIAfterLogin();
                    return;
                }
            } catch (e) {
                console.error("Error parsing user data:", e);
            }
        }
        
        // If we reach here, either there's no user data or it's invalid
        resetLoginButton();
    }
    
    // Helper function to reset the login button
    function resetLoginButton() {
        const userBtn = document.getElementById('loginButton');
        userBtn.textContent = 'LOGIN';
        userBtn.setAttribute('onclick', 'togglePopup()');
        
        // Remove any existing event listeners
        const newBtn = userBtn.cloneNode(true);
        userBtn.parentNode.replaceChild(newBtn, userBtn);
        
        // Clear any invalid data
        localStorage.removeItem('currentUser');
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

document.addEventListener('DOMContentLoaded', function() {
    // Handler for closing the signin frame
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
    
    // Handler for going back to login options
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
});

document.addEventListener('DOMContentLoaded', function() {
  // Handler for closing the signin frame
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
  
  // Handler for going back to login options
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

 

        // Always set a background image - either the user's or the default
 

        previewDiv.style.backgroundImage = `url(${userData.profile_pic || '/images/profiles/default-profile.png'})`;
 

        
 

        // If there's an error loading the image, use the default
 

        previewDiv.onerror = function() {
 

            this.style.backgroundImage = `url('/images/profiles/default-profile.png')`;
 

        };
 

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

document.addEventListener('DOMContentLoaded', function() {

 

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


});





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





async function confirmDeleteAccount() {


  try {


      const currentUser = JSON.parse(localStorage.getItem('currentUser'));


      


      if (!currentUser || !currentUser.userId) {


          alert('Session expired. Please log in again.');


          return;


      }


      


      // Changed from PUT to POST


      const response = await fetch('/api/users/delete-account', {


          method: 'POST',


          headers: {


              'Content-Type': 'application/json'


          },


          body: JSON.stringify({ userId: currentUser.userId })


      });


      


      // Debug logs


      console.log('Delete account response status:', response.status);


      


      if (!response.ok) {


          const errorText = await response.text();


          console.error('Server error:', errorText);


          throw new Error(`Server returned ${response.status}: ${errorText || 'Unknown error'}`);


      }


      


      const data = await response.json();


      


      if (data.success) {


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


          throw new Error(data.message || 'Failed to delete account');


      }


  } catch (error) {


      console.error('Error deleting account:', error);


      alert('Failed to delete account: ' + error.message);


  }


}

// delete resto button
// function toggleDeleteConfirm() {
//     const popup = document.getElementById('deleteConfirmPopup');
//     const backdrop = document.getElementById('backdrop');
//     const isHidden = (popup.style.display === 'none' || popup.style.display === '');
    
//     popup.style.display = isHidden ? 'block' : 'none';
//     backdrop.style.display = isHidden ? 'block' : 'none';

//     if (isHidden) {
//         document.body.style.pointerEvents = 'none';
//         popup.style.pointerEvents = 'auto';
//         backdrop.style.pointerEvents = 'auto';
//     } else {
//         document.body.style.pointerEvents = 'auto';
//     }
// }

// rating functionality
// Add this to your RestoInfo.js file or create a new script tag at the bottom of your HTML
/* filepath: a:\DLSU - Second Year\Term 2\CCAPDEV\CCAPDEV.mco\Website\javascript\RestoInfo.js */
// Add these functions to the file

// // Function to toggle the review modal
// function toggleReviewModal() {
//     const backdrop = document.getElementById('backdrop');
//     const reviewModal = document.getElementById('reviewModal');
    
//     if (reviewModal.style.display === 'block') {
//         reviewModal.style.display = 'none';
//         backdrop.style.display = 'none';
//     } else {
//         reviewModal.style.display = 'block';
//         backdrop.style.display = 'block';
//     }
// }

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

// delete resto button
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

// rating functionality
// Add this to your RestoInfo.js file or create a new script tag at the bottom of your HTML
/* filepath: a:\DLSU - Second Year\Term 2\CCAPDEV\CCAPDEV.mco\Website\javascript\RestoInfo.js */
// Add these functions to the file

// Function to toggle the review modal
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

// Initialize star rating functionality when the document loads
document.addEventListener('DOMContentLoaded', function() {
    // Star rating functionality
    const stars = document.querySelectorAll('.star');
    const ratingText = document.getElementById('rating-text');
    
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const value = this.getAttribute('data-value');
            ratingText.textContent = `${value} out of 5`;
            
            // Reset all stars
            stars.forEach(s => {
                s.classList.remove('active');
            });
            
            // Activate clicked star and all before it
            stars.forEach(s => {
                if (s.getAttribute('data-value') <= value) {
                    s.classList.add('active');
                }
            });
        });
    });
});

function setupProfileTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            const tabName = button.getAttribute('data-tab');
            const targetContent = document.getElementById(`${tabName}-content`);
            if (targetContent) {
                targetContent.classList.add('active');
            } else {
                console.error(`Tab content #${tabName}-content not found`);
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    setupProfileTabs();
    
    // Debug check for reviews
    const reviewsContent = document.getElementById('reviews-content');
    if (reviewsContent) {
        console.log('Reviews content found');
        console.log('Reviews HTML:', reviewsContent.innerHTML);
        const reviewsItems = reviewsContent.querySelectorAll('.review-card');
        console.log(`Found ${reviewsItems.length} review cards`);
    } else {
        console.error('Reviews content element not found!');
    }
});