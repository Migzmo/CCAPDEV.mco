function togglePopup() {
    const popup = document.getElementById('loginPopup');
    const isHidden = (popup.style.display === 'none');
    popup.style.display = isHidden ? 'block' : 'none';

    if (isHidden) {
        document.body.style.pointerEvents = 'none';
        popup.style.pointerEvents = 'auto';
    } else {
        document.body.style.pointerEvents = 'auto';
    }
}