function togglePopup() {
    const popup = document.getElementById('loginframe');
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