document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded, looking for form");
    const form = document.forms['restoForm'];
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            if (!validateForm()) {
                return;
            }
            
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
            formData.append('cuisine_id', document.getElementById('cuisine').value);
            
            // Debug log what's being sent
            console.log("FormData being sent:");
            for (let pair of formData.entries()) {
                console.log(pair[0] + ': ' + (pair[0] === 'image' ? 'File data' : pair[1]));
            }
            
            const submitButton = document.getElementById('updateSub');
            if (submitButton) submitButton.disabled = true;
            
            // Send data to server 
            fetch('/restaurant/api/submitupdate', {
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
                
                // Try to parse the error response
                if (error.message && error.message.includes('already exists')) {
                    alert('A restaurant with this name already exists. Please use a different name.');
                } else {
                    alert('Failed to update restaurant. Please try again.');
                }
            })
            .finally(() => {
                if (submitButton) submitButton.disabled = false;
            });
        });
    } else {
        console.error("Form with name 'restoForm' not found!");
    }
});

// Add this function before form submission to validate time
function validateForm() {
    // Get opening and closing times
    const openingTime = document.getElementById('opening-time').value;
    const closingTime = document.getElementById('closing-time').value;
    
    // Compare times (as strings, in 24h format they'll compare correctly)
    if (openingTime >= closingTime) {
        alert('Opening time must be before closing time');
        return false;
    }
    
    return true;
}


// Function to populate the edit form with existing restaurant data
function populateEditForm() {
    console.log("Populating edit form with existing restaurant data");
    
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
    
    // Get restaurant ID from URL
    const pathSegments = window.location.pathname.split('/');
    const restaurantId = pathSegments[pathSegments.length - 1];
    
    // Add hidden field for restaurant ID if it doesn't exist
    let hiddenIdField = document.getElementById('hidden-id');
    if (!hiddenIdField) {
        hiddenIdField = document.createElement('input');
        hiddenIdField.type = 'hidden';
        hiddenIdField.id = 'hidden-id';
        hiddenIdField.name = 'resto_id';
        document.forms['restoForm'].appendChild(hiddenIdField);
    }
    hiddenIdField.value = restaurantId;

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
        // Convert from 12-hour format to 24-hour format for time inputs
        const openingTime = convertTo24Hour(timeParts[0].trim());
        const closingTime = convertTo24Hour(timeParts[1].trim());
        
        document.getElementById('opening-time').value = openingTime;
        document.getElementById('closing-time').value = closingTime;
    }
    
    document.getElementById('phone').value = restaurantPhone;
    document.getElementById('email').value = restaurantEmail;
    document.getElementById('payment').value = restaurantPayment;
    document.getElementById('perks').value = perksText;
    
    // Set cuisine dropdown to match current cuisine
    const cuisineSelect = document.getElementById('cuisine');
    if (cuisineSelect) {
        for (let i = 0; i < cuisineSelect.options.length; i++) {
            if (cuisineSelect.options[i].text === cuisineType) {
                cuisineSelect.selectedIndex = i;
                break;
            }
        }
    }
    
    console.log("Form populated successfully");
}

// Helper function to convert 12-hour time format to 24-hour format for inputs
function convertTo24Hour(time12h) {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    
    if (hours === '12') {
        hours = '00';
    }
    
    if (modifier === 'PM' && hours !== '00') {
        hours = parseInt(hours, 10) + 12;
    }
    
    return `${hours.padStart(2, '0')}:${minutes}`;
}

/**
 * Toggle popup for creating/editing a restaurant
 */
function togglePopupCreateResto() {
    const backdrop = document.getElementById('backdrop');
    const createRestoFrame = document.getElementById('createRestoFrame');
    
    if (createRestoFrame && backdrop) {
        if (createRestoFrame.style.display === 'block') {
            // Closing the form
            createRestoFrame.style.display = 'none';
            backdrop.style.display = 'none';
        } else {
            // Opening the form - populate with existing data if editing
            createRestoFrame.style.display = 'block';
            backdrop.style.display = 'block';
            
            // Check if we're on a restaurant page (editing mode)
            const isEditMode = window.location.pathname.includes('/restaurant/');
            if (isEditMode && typeof populateEditForm === 'function') {
                // Set form title to indicate editing
                const formTitle = createRestoFrame.querySelector('.createResto-content h2');
                if (formTitle) formTitle.textContent = 'Edit Restaurant';
                
                // Add a small delay to ensure DOM is ready
                setTimeout(populateEditForm, 100);
            }
        }
    } else {
        console.error('Popup elements not found');
    }
}