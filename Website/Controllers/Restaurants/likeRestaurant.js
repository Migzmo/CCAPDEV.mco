document.addEventListener('DOMContentLoaded', function () {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
  
    // Tab switching logic
    tabButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const tab = button.getAttribute('data-tab');
  
        // Remove active class from all buttons and contents
        tabButtons.forEach((btn) => btn.classList.remove('active'));
        tabContents.forEach((content) => content.classList.remove('active'));
  
        // Add active class to the clicked button and corresponding content
        button.classList.add('active');
        document.getElementById(`${tab}-content`).classList.add('active');
  
        // Fetch and render saved restaurants when the "Saved" tab is clicked
        if (tab === 'saved') {
          fetchSavedRestaurants();
        }
      });
    });
  
    // Fetch and render saved restaurants on page load (optional)
    fetchSavedRestaurants();
  });
  
  function fetchSavedRestaurants() {
    const userId = JSON.parse(localStorage.getItem('currentUser')).userId; // Get the logged-in user's ID
  
    fetch(`/api/likes/saved-restaurants/${userId}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          console.log('Saved Restaurants:', data.savedRestaurants);
          renderSavedRestaurants(data.savedRestaurants);
        } else {
          console.error('Error:', data.message);
        }
      })
      .catch((error) => console.error('Fetch Error:', error));
  }
  
  function renderSavedRestaurants(restaurants) {
    const container = document.getElementById('saved-restaurants-container');
    container.innerHTML = ''; // Clear existing content
  
    if (restaurants.length === 0) {
      container.innerHTML = '<p>No saved restaurants found.</p>';
      return;
    }
  
    restaurants.forEach((restaurant) => {
      const card = document.createElement('div');
      card.className = 'restaurant-card';
      card.innerHTML = `
        <img src="${restaurant.resto_img}" alt="${restaurant.resto_name}">
        <h3>${restaurant.resto_name}</h3>
        <p>${restaurant.resto_address}</p>
        <p>${restaurant.cuisine_id}</p>
      `;
      container.appendChild(card);
    });
  }