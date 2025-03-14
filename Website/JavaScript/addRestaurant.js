document.addEventListener('DOMContentLoaded', function() {
    const form = document.forms['restoForm'];

    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            // Create FormData object to properly handle files
            const formData = new FormData(this);

            // Send form with files using fetch
            fetch('/', {
                method: 'POST',
                body: formData
            })
            .then(response => {
                console.log("Response status:", response.status);
                if (!response.ok) {
                    response.text().then(text => console.error("Server error details:", text));
                    throw new Error('Server error');
                }
                return response.json();
            })
            .then(data => {
                console.log("Success response:", data);
                alert('Restaurant added successfully!');
                if (typeof togglePopupCreateResto === 'function') {
                    togglePopupCreateResto();
                }
                window.location.href = `/restaurant/${data.resto_id}`;
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Failed to add restaurant. Please try again.');
            });
        });
    }
});