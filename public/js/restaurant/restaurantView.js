// public/js/restaurant/restaurantView.js
document.addEventListener('DOMContentLoaded', function() {
    // Fix profile links in reviews
    const profileLinks = document.querySelectorAll('.scroll-obj h2 a');
    profileLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '/profile/' || href.includes('undefined')) {
                e.preventDefault();
                alert('User profile not available');
            }
        });
    });
    
    // Fix profile images
    const profileImages = document.querySelectorAll('.profile-pic');
    profileImages.forEach(img => {
        img.onerror = function() {
            this.src = '/images/profiles/default-profile.png';
        };
    });
    
    // Toggle heart function
    const heartIcon = document.getElementById("heartIcon");
    if (heartIcon) {
        heartIcon.addEventListener('click', toggleHeart);
    }
});

function toggleHeart() {
    const heartIcon = document.getElementById("heartIcon");
    heartIcon.classList.toggle("liked");
    heartIcon.style.color = heartIcon.classList.contains("liked") ? "red" : "gray";
}