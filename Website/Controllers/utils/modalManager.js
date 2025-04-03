/**
 * Modal Manager Module
 * Central utility for managing modal visibility and authentication forms
 */

/**
 * Show the login modal
 */
function showLoginModal() {
  const loginframe = document.getElementById('loginframe');
  const backdrop = document.getElementById('backdrop');
  
  if (loginframe && backdrop) {
    loginframe.style.display = 'block';
    backdrop.style.display = 'block';
    document.body.style.pointerEvents = 'none';
    loginframe.style.pointerEvents = 'auto';
    backdrop.style.pointerEvents = 'auto';
  } else {
    console.error("Login frame elements not found");
  }
}

/**
 * Close the login modal
 */
function closeLoginModal() {
  const loginframe = document.getElementById('loginframe');
  const backdrop = document.getElementById('backdrop');
  
  if (loginframe && backdrop) {
    loginframe.style.display = 'none';
    backdrop.style.display = 'none';
    document.body.style.pointerEvents = 'auto';
  }
}

/**
 * Show the signin modal
 */
function showSigninModal() {
  const signinFrame = document.getElementById('signinframe');
  const loginFrame = document.getElementById('loginframe');
  const backdrop = document.getElementById('backdrop');
  
  if (loginFrame) loginFrame.style.display = 'none';
  
  if (signinFrame && backdrop) {
    signinFrame.style.display = 'block';
    backdrop.style.display = 'block';
    document.body.style.pointerEvents = 'none';
    signinFrame.style.pointerEvents = 'auto';
    backdrop.style.pointerEvents = 'auto';
  }
}

/**
 * Close the signin modal
 */
function closeSigninModal() {
  const signinFrame = document.getElementById('signinframe');
  const backdrop = document.getElementById('backdrop');
  
  if (signinFrame) {
    signinFrame.style.display = 'none';
    
    // Only hide backdrop if no other modals are visible
    const otherModalVisible = document.querySelector('#loginframe[style*="display: block"], #registerframe[style*="display: block"]');
    if (!otherModalVisible && backdrop) {
      backdrop.style.display = 'none';
      document.body.style.pointerEvents = 'auto';
    }
  }
}

/**
 * Handle the login button click event
 */
function setupLoginButtonHandler() {
  const loginButtons = document.querySelectorAll('#loginButton, .login-button');
  
  loginButtons.forEach(button => {
    // Remove any existing event listeners by cloning
    const newButton = button.cloneNode(true);
    if (button.parentNode) {
      button.parentNode.replaceChild(newButton, button);
    }
    
    // Add the event listener to the new button
    newButton.addEventListener('click', function(e) {
      e.preventDefault();
      console.log("Login button clicked - showing login modal");
      showLoginModal();
    });
  });
}

/**
 * Handle the signin form submission
 */
function setupSigninFormHandler() {
  const signinSubmitBtn = document.getElementById('signin-submit-btn');
  if (!signinSubmitBtn) {
    console.error("Signin submit button not found");
    return;
  }
  
  // Add click event listener
  signinSubmitBtn.addEventListener('click', async function(event) {
    event.preventDefault();
    console.log("Signin button clicked");
    
    const formData = {
      username: document.getElementById('signin-username').value,
      password: document.getElementById('signin-password').value
    };
    
    // Validate inputs
    if (!formData.username || !formData.password) {
      alert('Please enter both username and password');
      return;
    }
    
    try {
      this.disabled = true;
      
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      console.log("Login response:", data);
      
      if (data.success) {
        // Store the user session info
        localStorage.setItem('currentUser', JSON.stringify({
          username: data.username,
          userId: data.userId,
          accountType: data.accountType
        }));
        
        alert('Login successful!');
        window.location.href = window.location.pathname; // Reload the current page
      } else {
        alert(data.message || 'Login failed. Please check your credentials.');
        this.disabled = false;
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Error during login. Please try again.');
      this.disabled = false;
    }
  });
}

/**
 * Initialize all modal interaction handlers
 */
function initializeModalHandlers() {
  // Set up login button handlers
  setupLoginButtonHandler();
  
  // Set up signin form submission handler
  setupSigninFormHandler();
  
  // Setup modal navigation buttons
  const signinButton = document.querySelector('.signin-button');
  if (signinButton) {
    signinButton.addEventListener('click', function() {
      showSigninModal();
    });
  }
  
  const closeSigninBtn = document.getElementById('closeSignin');
  if (closeSigninBtn) {
    closeSigninBtn.addEventListener('click', closeSigninModal);
  }
  
  const backToOptionsBtn = document.getElementById('backToOptions');
  if (backToOptionsBtn) {
    backToOptionsBtn.addEventListener('click', function() {
      closeSigninModal();
      showLoginModal();
    });
  }
  
  const closeLoginBtn = document.getElementById('closeLogin');
  if (closeLoginBtn) {
    closeLoginBtn.addEventListener('click', closeLoginModal);
  }
}

// Export functions
export {
  showLoginModal,
  closeLoginModal,
  showSigninModal,
  closeSigninModal,
  setupLoginButtonHandler,
  setupSigninFormHandler,
  initializeModalHandlers
};
