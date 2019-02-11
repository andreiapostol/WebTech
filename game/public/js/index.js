function loadImage(url){
    return new Promise(resolve => {
        const image = new Image();
        image.addEventListener('load', ()=>{
            resolve(image);
        });
        image.src = url;
    })
}
const canvas = document.getElementById('screen');
const context = canvas.getContext('2d');

// context.fillRect(25, 0, 50, 90);

loadImage('/img/inca_back2.png').then(image => {
    context.drawImage(image,
        0, 0,
        32, 32, 
        0, 0, 
        32, 32);
    context.drawImage(image,
            96, 32,
            32, 32, 
            0, 32, 
            32, 32);
});