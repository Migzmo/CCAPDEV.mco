// public/js/account/login.js
document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.querySelector('.signin-form');
  
  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const username = document.getElementById('signin-username').value;
      const password = document.getElementById('signin-password').value;
      
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
          // Store user data in localStorage
          localStorage.setItem('currentUser', JSON.stringify({
            userId: data.userId,
            username: data.username,
            accountType: data.accountType
          }));
          
          // Update UI after login
          updateUIAfterLogin();
          
          // Close login form
          togglePopup();
          
          // Redirect if needed
          // window.location.href = '/';
        } else {
          alert(data.message || 'Login failed');
        }
      } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please try again.');
      }
    });
  }
  
  function updateUIAfterLogin() {
    const userBtn = document.getElementById('loginButton');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (currentUser) {
      userBtn.textContent = 'USER PROFILE';
      userBtn.removeAttribute('onclick');
      userBtn.addEventListener('click', function() {
        toggleUserDropdown(userBtn);
      });
    }
  }
  
  // Check login status on page load
  checkUserLoggedIn();
});