    document.getElementById('register').addEventListener('click', function() {
        const loginFrame = document.getElementById('loginframe');
        const registerFrame = document.getElementById('registerframe');
        const backdrop = document.getElementById('backdrop');

        loginFrame.style.display = 'none';
        registerFrame.style.display = 'block';
        backdrop.style.display = 'block';

        document.body.style.pointerEvents = 'none';
        registerFrame.style.pointerEvents = 'auto';
        backdrop.style.pointerEvents = 'auto';
    });

    function togglePopup() {
        const loginFrame = document.getElementById('loginframe');
        const backdrop = document.getElementById('backdrop');
        const registerFrame = document.getElementById('registerframe');
        const isHidden = (loginFrame.style.display === 'none');

        loginFrame.style.display = isHidden ? 'block' : 'none';
        backdrop.style.display = isHidden ? 'block' : 'none';
        registerFrame.style.display = 'none';

        if (isHidden) {
            document.body.style.pointerEvents = 'none';
            loginFrame.style.pointerEvents = 'auto';
            backdrop.style.pointerEvents = 'auto';
        } else {
            document.body.style.pointerEvents = 'auto';
        }
    }

    document.addEventListener('DOMContentLoaded', function() {
        document.getElementById('closeRegister').addEventListener('click', function() {
            const registerFrame = document.getElementById('registerframe');
            const backdrop = document.getElementById('backdrop');

            registerFrame.style.display = 'none';
            backdrop.style.display = 'none';
            document.body.style.pointerEvents = 'auto';
        });

        document.getElementById('backToLogin').addEventListener('click', function() {
            const loginFrame = document.getElementById('loginframe');
            const registerFrame = document.getElementById('registerframe');

            registerFrame.style.display = 'none';
            loginFrame.style.display = 'block';

            document.body.style.pointerEvents = 'none';
            loginFrame.style.pointerEvents = 'auto';
        });
    });

document.getElementById('closeRegister').addEventListener('click', function() {
    const registerFrame = document.getElementById('registerframe');
    const backdrop = document.getElementById('backdrop');

    registerFrame.style.display = 'none';
    backdrop.style.display = 'none';
    document.body.style.pointerEvents = 'auto';
});

document.querySelector('.signin-button').addEventListener('click', function() {
    const loginFrame = document.getElementById('loginframe');
    const signinFrame = document.getElementById('signinframe');
    const backdrop = document.getElementById('backdrop');

    loginFrame.style.display = 'none';
    signinFrame.style.display = 'block';
    backdrop.style.display = 'block';

    document.body.style.pointerEvents = 'none';
    signinFrame.style.pointerEvents = 'auto';
    backdrop.style.pointerEvents = 'auto';
});

document.getElementById('backToOptions').addEventListener('click', function() {
    const signinFrame = document.getElementById('signinframe');
    const loginFrame = document.getElementById('loginframe');

    signinFrame.style.display = 'none';
    loginFrame.style.display = 'block';

    document.body.style.pointerEvents = 'none';
    loginFrame.style.pointerEvents = 'auto';
});

document.getElementById('closeSignin').addEventListener('click', function() {
    const signinFrame = document.getElementById('signinframe');
    const backdrop = document.getElementById('backdrop');

    signinFrame.style.display = 'none';
    backdrop.style.display = 'none';
    document.body.style.pointerEvents = 'auto';
});

function togglePopupCreateResto() {
    const popup = document.getElementById('createRestoFrame');
    const backdrop = document.getElementById('backdrop');
    const isHidden = (popup.style.display === 'none');
    popup.style.display = isHidden ? 'block' : 'none';
    backdrop.style.display = isHidden ? 'block' : 'none';

    if (isHidden) {
        document.body.style.pointerEvents = 'none';
        popup.style.pointerEvents = 'auto';
    } else {
        document.body.style.pointerEvents = 'auto';
    }
}

// delete resto button
function toggleDeleteConfirm() {
    const popup = document.getElementById('deleteConfirmPopup');
    const backdrop = document.getElementById('backdrop');
    const isHidden = (popup.style.display === 'none' || popup.style.display === '');
    
    popup.style.display = isHidden ? 'block' : 'none';
    backdrop.style.display = isHidden ? 'block' : 'none';

    if (isHidden) {
        document.body.style.pointerEvents = 'none';
        popup.style.pointerEvents = 'auto';
        backdrop.style.pointerEvents = 'auto';
    } else {
        document.body.style.pointerEvents = 'auto';
    }
}

// rating functionality
// Add this to your RestoInfo.js file or create a new script tag at the bottom of your HTML
/* filepath: a:\DLSU - Second Year\Term 2\CCAPDEV\CCAPDEV.mco\Website\javascript\RestoInfo.js */
// Add these functions to the file

// Function to toggle the review modal
function toggleReviewModal() {
    const backdrop = document.getElementById('backdrop');
    const reviewModal = document.getElementById('reviewModal');
    
    if (reviewModal.style.display === 'block') {
        reviewModal.style.display = 'none';
        backdrop.style.display = 'none';
    } else {
        reviewModal.style.display = 'block';
        backdrop.style.display = 'block';
    }
}

// Initialize star rating functionality when the document loads
document.addEventListener('DOMContentLoaded', function() {
    // Star rating functionality
    const stars = document.querySelectorAll('.star');
    const ratingText = document.getElementById('rating-text');
    
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const value = this.getAttribute('data-value');
            ratingText.textContent = `${value} out of 5`;
            
            // Reset all stars
            stars.forEach(s => {
                s.classList.remove('active');
            });
            
            // Activate clicked star and all before it
            stars.forEach(s => {
                if (s.getAttribute('data-value') <= value) {
                    s.classList.add('active');
                }
            });
        });
    });
});