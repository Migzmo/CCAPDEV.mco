let curImage = 0;
const catimage = document.querySelectorAll('category');
const category = document.querySelectorAll('slider');

function updateCatImage(){
    category.scrollTo({
        left: curImage * category.clientWidth,
        behavior: 'smooth'
    })
}
function nextCateg(){
    if(curImage < catimage.length - 1){
        curImage++;
        updateCatImage();
    }
}
function prevCateg(){
    if(curImage > 0){
        curImage--;
        updateCatImage();
    }
}
