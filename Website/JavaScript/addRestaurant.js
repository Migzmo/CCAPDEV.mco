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
                            body: formData // Don't set Content-Type header - fetch sets it with boundary
                        })
                        .then(response => {
                            if (!response.ok) throw new Error('Server error');
                            return response.json();
                        })
                        .then(data => {
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