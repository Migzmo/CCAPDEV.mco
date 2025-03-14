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
        // Check if user is logged in on page load
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
            document.getElementById('loginButton').textContent = 'USER PROFILE';
        }

        // Update login button click handler
        document.getElementById('loginButton').addEventListener('click', function(e) {
            const currentUser = localStorage.getItem('currentUser');
            if (currentUser && JSON.parse(currentUser).userId) {
                // Redirect to profile page if user is logged in
                e.preventDefault();
                const userId = JSON.parse(currentUser).userId;
                window.location.href = `/profile/${userId}`;
            } else {
                // Otherwise show login popup (using existing togglePopup function)
                togglePopup();
            }
        });
    });

    document.addEventListener('DOMContentLoaded', function() {
      // Find the form by class since it doesn't have an ID
      const signinForm = document.querySelector('.signin-form');

      if (signinForm) {
        signinForm.addEventListener('submit', function(event) {
          event.preventDefault();
          handleSignin(event);
        });
      }

      // Check if user is already logged in
      checkUserLoggedIn();
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

          // Update login button to show user profile
          document.getElementById('loginButton').textContent = 'USER PROFILE';

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
                    username: formData.username,
                    userId: data.userId || 0
                }));

                // Update login button to show user profile
                document.getElementById('loginButton').textContent = 'USER PROFILE';

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

document.getElementById('backToOptions').addEventListener('click', function() {
    const signinFrame = document.getElementById('signinframe');
    const loginFrame = document.getElementById('loginframe');

    signinFrame.style.display = 'none';
    loginFrame.style.display = 'block';

    document.body.style.pointerEvents = 'none';
    loginFrame.style.pointerEvents = 'auto';
});

document.getElementById('closeSignin').addEventListener('click', function() {
    const signinFrame = document.getElementById('signinframe');
    const backdrop = document.getElementById('backdrop');

    signinFrame.style.display = 'none';
    backdrop.style.display = 'none';
    document.body.style.pointerEvents = 'auto';
});

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