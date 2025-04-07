/**
 * Authentication Manager Module
 * Handles user authentication, login, logout, and session management
 */

/**
 * Login the user using the API
 * @param {Object} credentials - User credentials with username and password
 * @returns {Promise<Object>} - Response from the server
 */
async function loginUser(credentials) {
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Server responded with ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success) {
            // Store the user session info
            localStorage.setItem('currentUser', JSON.stringify({
                username: data.username,
                userId: data.userId,
                accountType: data.accountType
            }));
            window.location.reload();
            return { success: true, data };
            
        } else {
            throw new Error(data.message || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Update the UI after successful login
 */
function updateUIAfterLogin() {
    const userBtn = document.getElementById('loginButton');
    if (!userBtn) return;
    
    const newBtn = document.createElement('button');
    newBtn.id = 'loginButton';
    newBtn.textContent = 'USER PROFILE';
    
    userBtn.parentNode.replaceChild(newBtn, userBtn);
    
    newBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        toggleUserDropdown(this);
    });
    
    console.log('UI updated for logged-in user');
}

/**
 * Check if user is logged in and update UI accordingly
 * @returns {boolean} - Whether the user is logged in
 */
function checkUserLoggedIn() {
    const currentUserString = localStorage.getItem('currentUser');
    if (currentUserString) {
        try {
            const currentUser = JSON.parse(currentUserString);
            if (currentUser && currentUser.userId) {
                // Valid user data exists
                updateUIAfterLogin();
                return true;
            }
        } catch (e) {
            console.error("Error parsing user data:", e);
        }
    }
    
    // If we reach here, either there's no user data or it's invalid
    resetLoginButton();
    return false;
}

async function checkAuthStatus() {
    const localUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // If we have a local user, verify with server
    if (localUser) {
      try {
        const response = await fetch('/auth/verify');
        
        if (!response.ok) {
          // Server says we're not logged in, clear localStorage
          console.warn('Session verification failed - clearing local storage');
          localStorage.removeItem('currentUser');
          resetLoginButton();
          return null;
        }
        
        const data = await response.json();
        if (data.authenticated) {
          updateUIAfterLogin();
          return data.user;
        }
      } catch (error) {
        console.error('Auth verification failed:', error);
        // On network error, fall back to local data
        return localUser;
      }
    }
    
    // No local user data
    resetLoginButton();
    return null;
  }

/**
 * Reset the login button to its default state
 */
function resetLoginButton() {
    const userBtn = document.getElementById('loginButton');
    if (!userBtn) return;
    
    const newBtn = document.createElement('button');
    newBtn.id = 'loginButton';
    newBtn.textContent = 'LOGIN';
    
    userBtn.parentNode.replaceChild(newBtn, userBtn);
    
    newBtn.addEventListener('click', function(e) {
        e.preventDefault();
        togglePopup();
    });

    localStorage.removeItem('currentUser');
    console.log('Login button reset to default state');
}

function toggleUserDropdown(userBtn) {
    const existingDropdown = document.querySelector('.user-dropdown');

    if (existingDropdown) {
        existingDropdown.remove();
        return;
    }

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        console.error('No user data found');
        return;
    }

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
    const navbarHeight = navbar ? navbar.offsetHeight : 0;

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
        fetch('/auth/logout')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Clear local data after server confirms session destruction
                localStorage.removeItem('currentUser');
                resetLoginButton();
                // Redirect to home page
                window.location.href = '/';
            } else {
                console.error('Logout failed:', data.message);
            }
        })
        .catch(error => {
            console.error('Error during logout:', error);
        });
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

// Export functions
export { 
    loginUser, 
  updateUIAfterLogin, 
  checkUserLoggedIn,
  checkAuthStatus,   
  resetLoginButton, 
  toggleUserDropdown 
};