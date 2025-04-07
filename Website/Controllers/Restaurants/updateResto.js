document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded, looking for form");
    const form = document.forms['restoForm'];
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log("Form submitted!");

            // Validate time (opening time must be before closing time)
            const openingTime = document.getElementById('opening-time').value;
            const closingTime = document.getElementById('closing-time').value;

            if (openingTime && closingTime) {
                // Convert to Date objects for comparison
                const openDate = new Date(`2000-01-01T${openingTime}`);
                const closeDate = new Date(`2000-01-01T${closingTime}`);
                
                if (closeDate <= openDate) {
                    alert("Closing time must be after opening time");
                    return;
                }
            }
            
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
            
            // Map form fields to what the server expects - TRIM ALL TEXT INPUTS
            formData.append('name', document.getElementById('resto-name').value.trim());
            formData.append('address', document.getElementById('address1').value.trim() + 
                (document.getElementById('address2').value ? ', ' + document.getElementById('address2').value.trim() : ''));
            formData.append('opening_time', document.getElementById('opening-time').value);
            formData.append('closing_time', document.getElementById('closing-time').value);
            formData.append('phoneNumber', document.getElementById('phone').value.trim());
            formData.append('email', document.getElementById('email').value.trim());
            formData.append('payment', document.getElementById('payment').value.trim());
            formData.append('perks', document.getElementById('perks').value.trim());
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
                console.log("Response received:", response.status, response.statusText);
                console.log("Headers:", [...response.headers.entries()]);
                
                return response.json().then(data => {
                    if (response.ok || data.success) {
                        return data;
                    }
                    throw new Error(JSON.stringify(data));
                });
            })
            .then(data => {
                console.log("Success data:", data);
                // Display appropriate success message based on the response
                if (data.message && data.message.includes('no changes detected')) {
                    alert('No changes were detected. Restaurant remains unchanged.');
                } else {
                    alert('Restaurant Updated successfully!');
                }
                
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
                
                // Try to parse the error message as JSON
                try {
                    const errorData = JSON.parse(error.message);
                    
                    // If the error contains data indicating it was actually successful
                    if (errorData.success === true || errorData.updated === true) {
                        console.log("Despite error response, update appears successful");
                        alert('Restaurant Updated successfully!');
                        
                        // Close popup if needed
                        if (typeof togglePopupCreateResto === 'function') {
                            togglePopupCreateResto();
                        }
                        
                        // Get the ID from one of these sources
                        const restaurantId = errorData.resto_id || errorData.restaurant?.resto_id || resto_id;
                        
                        // Redirect to restaurant page with proper ID
                        window.location.href = `/restaurant/${restaurantId}`;
                        return;
                    }
                    
                    // Add more debugging to see what's coming back
                    console.log("Full error data:", errorData);
                    
                    if (errorData.error === 'duplicate_name') {
                        alert('Update failed: A restaurant with this name already exists. Please use a different name.');
                    } else if (errorData.message && errorData.message.includes('no changes detected')) {
                        // If the error is about no changes detected, still treat as success
                        alert('No changes were detected. Restaurant remains unchanged.');
                        togglePopupCreateResto();
                        window.location.href = `/restaurant/${resto_id}`;
                    } else {
                        alert(`Failed to update restaurant: ${errorData.message || 'Please try again.'}`);
                    }
                } catch (e) {
                    // If not JSON, show generic message
                    console.error('Error:', error);
                    console.log("Error name:", error.name);
                    console.log("Error message:", error.message);

                    console.error("Error parsing error message:", e);
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

// Function to populate the edit form with existing restaurant data
function populateEditForm() {
    console.log("Populating edit form");
    
    // Get restaurant data from the page
    const restaurantName = document.querySelector('.head-container h1').innerText;
    const restaurantAddress = document.querySelector('.information p:nth-of-type(1)').innerText;
    const restaurantTime = document.querySelector('.information p:nth-of-type(2)').innerText;
    const restaurantPhone = document.querySelector('.information p:nth-of-type(3)').innerText;
    const restaurantEmail = document.querySelector('.information p:nth-of-type(4)').innerText;
    const restaurantPayment = document.querySelector('.information p:nth-of-type(5)').innerText;
    const cuisineType = document.querySelector('.head-container p').innerText;
    
    console.log("Found cuisine type:", cuisineType);
    
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
    
    // Handle time (now formatted as "12:00 PM - 8:00 PM")
    const timeParts = restaurantTime.split('-').map(t => t.trim());
    if (timeParts.length === 2) {
        // Convert from 12-hour format to 24-hour format for time inputs
        const openingTime = convertTo24Hour(timeParts[0]);
        const closingTime = convertTo24Hour(timeParts[1]);
        
        console.log("Converted opening time:", timeParts[0], "to", openingTime);
        console.log("Converted closing time:", timeParts[1], "to", closingTime);
        
        document.getElementById('opening-time').value = openingTime;
        document.getElementById('closing-time').value = closingTime;
    }
    
    document.getElementById('phone').value = restaurantPhone;
    document.getElementById('email').value = restaurantEmail;
    document.getElementById('payment').value = restaurantPayment;
    document.getElementById('perks').value = perksText;
    
    // Explicitly set the cuisine dropdown by value
    const cuisineSelect = document.getElementById('cuisine');
    if (cuisineSelect) {
        // Try to find the option that matches cuisineType
        let optionFound = false;
        
        for (let i = 0; i < cuisineSelect.options.length; i++) {
            if (cuisineSelect.options[i].text.trim() === cuisineType.trim()) {
                cuisineSelect.selectedIndex = i;
                console.log("Cuisine matched:", cuisineType, "at index", i);
                optionFound = true;
                break;
            }
        }
        
        if (!optionFound) {
            console.warn("Could not find matching cuisine option for:", cuisineType);
        }
    } else {
        console.error("Cuisine select element not found");
    }
}

// Helper function to convert 12-hour time format to 24-hour format
function convertTo24Hour(timeStr) {
    // Parse time in format like "12:30 PM"
    const [timePart, ampm] = timeStr.split(' ');
    let [hours, minutes] = timePart.split(':');
    
    hours = parseInt(hours);
    minutes = minutes || '00';
    
    // Convert to 24-hour format
    if (ampm && ampm.toUpperCase() === 'PM' && hours < 12) {
        hours += 12;
    } else if (ampm && ampm.toUpperCase() === 'AM' && hours === 12) {
        hours = 0;
    }
    
    // Format as HH:MM for time input
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
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