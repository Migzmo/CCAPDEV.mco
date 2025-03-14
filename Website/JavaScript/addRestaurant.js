document.addEventListener('DOMContentLoaded', function() {
    // Make sure we find the form
    console.log("DOM loaded, looking for form");
    const form = document.forms['restoForm'];
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log("Form submitted!");
            
            // Create FormData from the form
            const formData = new FormData(this);
            
            // Get values for console debugging
            console.log("Form values:");
            for (let pair of formData.entries()) {
                console.log(pair[0] + ': ' + pair[1]);
            }
            
            // Create data object
            const restaurantData = {
                name: document.getElementById('resto-name').value,
                address: document.getElementById('address1').value + 
                    (document.getElementById('address2').value ? ', ' + document.getElementById('address2').value : ''),
                time: document.getElementById('opening-time').value + ' - ' + document.getElementById('closing-time').value,
                phoneNumber: document.getElementById('phone').value,
                email: document.getElementById('email').value,
                payment: document.getElementById('payment').value,
                perks: document.getElementById('perks').value,
                cuisine_name: document.getElementById('cuisine').value
            };
            
            console.log("Restaurant data to be sent:", restaurantData);
            
            // Get submit button
            const submitButton = document.getElementById('create-resto');
            if (submitButton) submitButton.disabled = true;
            
            // Send data to server
            fetch('/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(restaurantData)
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
                alert('Restaurant added successfully!');
                
                // Close popup
                if (typeof togglePopupCreateResto === 'function') {
                    togglePopupCreateResto();
                }
                
                // Redirect to restaurant page
                window.location.href = `/restaurant/${data.resto_id}`;
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Failed to add restaurant. Please try again.');
            })
            .finally(() => {
                if (submitButton) submitButton.disabled = false;
            });
        });
    } else {
        console.error("Form with name 'restoForm' not found!");
    }
});