document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded, looking for form");
    const form = document.forms['restoForm'];
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log("Form submitted!");
            
            // Use FormData to handle file uploads
            const formData = new FormData(this);
            
            // Make sure all fields are included by manually adding them
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
            
            // Get submit button
            const submitButton = document.getElementById('create-resto');
            if (submitButton) submitButton.disabled = true;
            
            // Send data to server - IMPORTANT: Don't set Content-Type header when using FormData
            fetch('/', {
                method: 'POST',
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
                alert('Restaurant added successfully!');
                
                // Close popup if needed
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