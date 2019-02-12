import {imageLoader, mapLoader} from './loaders.js';
import SpriteAPI from './spriteAPI.js';

function drawConstant(background, context, sprites){
    background.intervals.forEach(([x1, x2, y1, y2]) => {
        for(let x = x1; x < x2; x++){
            for(let y = y1; y < y2; y++){
                sprites.drawTile(background.tile, context, x, y);
            }
        }
    })
}

function drawAlternative(background, context, sprites){
    background.intervals.forEach(([x1, x2, y1, y2]) => {
        let step = 1;
        for(let x = x1; x < x2; x++){
            for(let y = y1; y < y2; y++){
                step === 1 ? sprites.drawTile(background.tileA, context, x, y) : sprites.drawTile(background.tileB, context, x, y);
                step *= -1;
            }
        }
    })
}

const canvas = document.getElementById('screen');
const context = canvas.getContext('2d');

imageLoader('/img/inca_back.png').then(image => {
    const sprites = new SpriteAPI(image, 16, 16);
    sprites.define('background', 7, 13);
    sprites.define('groundA', 2, 4);
    sprites.define('groundB', 3, 4);
    sprites.define('underground', 2, 11);

    mapLoader('intro').then(level => {
        // bg
        drawConstant(level.backgrounds[0], context, sprites);
        // floor
        drawAlternative(level.backgrounds[1], context, sprites);
        // beneath the floor
        drawConstant(level.backgrounds[2], context, sprites);
    });


});