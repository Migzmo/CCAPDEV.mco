document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded, looking for form");
    const form = document.forms['restoForm'];
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

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
            console.log("Form submitted!");
            
            
            const formData = new FormData(this);
            
            
            formData.append('name', document.getElementById('resto-name').value);
            formData.append('address', document.getElementById('address1').value + 
                (document.getElementById('address2').value ? ', ' + document.getElementById('address2').value : ''));
            formData.append('time', formatTimeTo12Hour(openingTime) + ' - ' + formatTimeTo12Hour(closingTime));
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
            
            
            const submitButton = document.getElementById('create-resto');
            if (submitButton) submitButton.disabled = true;
            
            // Send data to server 
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

// Function to format time from 24-hour to 12-hour format
function formatTimeTo12Hour(time24) {
    if (!time24) return '';
    
    const [hours24, minutes] = time24.split(':');
    let hours12 = parseInt(hours24) % 12;
    if (hours12 === 0) hours12 = 12;
    
    const ampm = parseInt(hours24) >= 12 ? 'PM' : 'AM';
    
    return `${hours12}:${minutes} ${ampm}`;
}