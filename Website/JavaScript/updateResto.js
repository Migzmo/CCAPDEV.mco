document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded, looking for form");
    const form = document.forms['restoForm'];
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log("Form submitted!");
            
            // Get restaurant ID
            const resto_id = document.getElementById('hidden-id').value;
            if (!resto_id) {
                console.error("Missing restaurant ID");
                alert("Error: Missing restaurant ID");
                return;
            }
            
            // Create FormData object for file uploads
            const formData = new FormData(this);
            
            // Make sure ID is included (might already be in the form)
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
            
            // Get submit button
            const submitButton = document.getElementById('updateSub');
            if (submitButton) submitButton.disabled = true;
            
            // Send data to server - IMPORTANT: Don't set Content-Type header when using FormData
            fetch('/api/submitupdate', {
                method: 'PUT',
                body: formData // Send FormData directly without Content-Type header
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