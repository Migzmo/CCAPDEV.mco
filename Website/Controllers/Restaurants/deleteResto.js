document.addEventListener('DOMContentLoaded', function() {
    
    const deleteButton = document.querySelector('.confirm-delete-btn');
    
    if (deleteButton) {
        deleteButton.addEventListener('click', function() {
            
            let restaurantId;
            
           
            const hiddenInput = document.getElementById('hidden-id');
            if (hiddenInput && hiddenInput.value) {
                restaurantId = hiddenInput.value;
            } 
            
            else {
                const pathSegments = window.location.pathname.split('/');
                restaurantId = pathSegments[pathSegments.length - 1];
            }
            
            if (!restaurantId) {
                alert('Could not determine restaurant ID');
                return;
            }
            
            // Send delete request
            fetch(`/api/restaurant/${restaurantId}`, {
                method: 'DELETE'
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Server error');
                }
                return response.json();
            })
            .then(data => {
                alert('Restaurant deleted successfully');
                
                window.location.href = '/';
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Failed to delete restaurant. Please try again.');
            });
        });
    }
});