/**
 * Utility functions for DOM manipulation and UI controls
 */

/**
 * Toggle the visibility of a popup element
 * @param {string} popupId - ID of the popup element
 * @param {string} backdropId - ID of the backdrop element
 * @param {boolean} show - Whether to show or hide the popup
 */
function togglePopupVisibility(popupId, backdropId, show) {
    const popup = document.getElementById(popupId);
    const backdrop = document.getElementById(backdropId);
    
    if (!popup || !backdrop) return;
    
    popup.style.display = show ? 'block' : 'none';
    backdrop.style.display = show ? 'block' : 'none';
    
    document.body.style.pointerEvents = show ? 'none' : 'auto';
    if (show) {
        popup.style.pointerEvents = 'auto';
        backdrop.style.pointerEvents = 'auto';
    }
}

/**
 * Show profile picture preview
 * @param {Event} e - Change event from file input
 * @param {string} previewId - ID of the preview element
 */
function showProfilePicPreview(e, previewId) {
    if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById(previewId);
            if (preview) {
                preview.style.backgroundImage = `url(${e.target.result})`;
            }
        };
        reader.readAsDataURL(e.target.files[0]);
    }
}

/**
 * Set up tab navigation functionality
 */
function setupProfileTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Initially hide all tab content except the first one
    tabContents.forEach((content, index) => {
        if (index === 0) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });
    
    // Set the first tab as active
    if (tabButtons.length > 0) {
        tabButtons[0].classList.add('active');
    }
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            const tabName = button.getAttribute('data-tab');
            const targetContent = document.getElementById(`${tabName}-content`);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
}

// Export the functions for external use
export { togglePopupVisibility, showProfilePicPreview, setupProfileTabs };