document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded, looking for form");
    const form = document.forms['restoForm'];
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log("Form submitted!");
            
            
            const resto_id = document.getElementById('hidden-id').value;
            if (!resto_id) {
                console.error("Missing restaurant ID");
                alert("Error: Missing restaurant ID");
                return;
            }
            
            
            const formData = new FormData(this);
            
            
            if (!formData.has('resto_id')) {
                formData.append('resto_id', resto_id);
            }
            
            // Map form fields to what the server expects
            formData.append('name', document.getElementById('resto-name').value);
            formData.append('address', document.getElementById('address1').value + 
                (document.getElementById('address2').value ? ', ' + document.getElementById('address2').value : ''));
            formData.append('time', document.getElementById('opening-time').value + ' - ' + document.getElementById('closing-time').value);
            formData.append('phoneNumber', document.getElementById('phone').value);
            formData.append('email', document.getElementById('email').value);
            formData.append('payment', document.getElementById('payment').value);
            formData.append('perks', document.getElementById('perks').value);
            formData.append('cuisine_name', document.getElementById('cuisine').value);
            
            // Debug log what's being sent
            console.log("FormData being sent:");
            for (let pair of formData.entries()) {
                console.log(pair[0] + ': ' + (pair[0] === 'image' ? 'File data' : pair[1]));
            }
            
            
            const submitButton = document.getElementById('updateSub');
            if (submitButton) submitButton.disabled = true;
            
            // Send data to server 
            fetch('/api/submitupdate', {
                method: 'PUT',
                body: formData 
            })
            .then(response => {
                console.log("Response received:", response.status);
                if (!response.ok) {
                    throw new Error('Server error');
                }
                return response.json();
            })
            .then(data => {
                console.log("Success data:", data);
                alert('Restaurant Updated successfully!');
                
                // Close popup if needed
                if (typeof togglePopupCreateResto === 'function') {
                    togglePopupCreateResto();
                }
                
                // Get the ID from one of these sources
                const restaurantId = data.resto_id || data.restaurant.resto_id || resto_id;
                
                // Redirect to restaurant page with proper ID
                window.location.href = `/restaurant/${restaurantId}`;
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Failed to update restaurant. Please try again.');
            })
            .finally(() => {
                if (submitButton) submitButton.disabled = false;
            });
        });
    } else {
        console.error("Form with name 'restoForm' not found!");
    }
});

// Function to populate the edit form with existing restaurant data
function populateEditForm() {
    // Get restaurant data from the page
    const restaurantName = document.querySelector('.head-container h1').innerText;
    const restaurantAddress = document.querySelector('.information p:nth-of-type(1)').innerText;
    const restaurantTime = document.querySelector('.information p:nth-of-type(2)').innerText;
    const restaurantPhone = document.querySelector('.information p:nth-of-type(3)').innerText;
    const restaurantEmail = document.querySelector('.information p:nth-of-type(4)').innerText;
    const restaurantPayment = document.querySelector('.information p:nth-of-type(5)').innerText;
    const cuisineType = document.querySelector('.head-container p').innerText;
    
    // Get perks from list items
    const perksItems = document.querySelectorAll('.information ul li');
    let perksText = '';
    perksItems.forEach((item, index) => {
        perksText += item.innerText;
        if (index < perksItems.length - 1) perksText += ', ';
    });
    
    // Populate form fields
    document.getElementById('resto-name').value = restaurantName;
    
    // Handle address (split if it contains a comma)
    const addressParts = restaurantAddress.split(',');
    document.getElementById('address1').value = addressParts[0].trim();
    if (addressParts.length > 1) {
        document.getElementById('address2').value = addressParts.slice(1).join(',').trim();
    }
    
    // Handle time (split by dash or hyphen)
    const timeParts = restaurantTime.split('-');
    if (timeParts.length === 2) {
        document.getElementById('opening-time').value = timeParts[0].trim();
        document.getElementById('closing-time').value = timeParts[1].trim();
    }
    
    document.getElementById('phone').value = restaurantPhone;
    document.getElementById('email').value = restaurantEmail;
    document.getElementById('payment').value = restaurantPayment;
    document.getElementById('perks').value = perksText;
    document.getElementById('cuisine').value = cuisineType;
}

// Modify the existing togglePopupCreateResto function to call populateEditForm
function togglePopupCreateResto() {
    const popup = document.getElementById('createRestoFrame');
    const backdrop = document.getElementById('backdrop');
    
    if (popup.style.display === 'block') {
        popup.style.display = 'none';
        backdrop.style.display = 'none';
    } else {
        popup.style.display = 'block';
        backdrop.style.display = 'block';
        populateEditForm(); // Call this function when opening the form
    }
}