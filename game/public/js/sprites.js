import {imageLoader} from './loaders.js';
import SpriteAPI from './spriteAPI.js';

export function characterLoader(){
    return imageLoader('/img/hero.png').then(image => {
        const sprites = new SpriteAPI(image, 50, 37);
        sprites.define('idle', 0, 0, 50, 37);
        return sprites;
    });
}

export function backgroundLoader(){
    return imageLoader('/img/inca_back.png').then(image => {
        const sprites = new SpriteAPI(image, 16, 16);
        sprites.defineTile('background', 7, 13);
        sprites.defineTile('groundA', 2, 4);
        sprites.defineTile('groundB', 3, 4);
        sprites.defineTile('underground', 2, 11);
        return sprites;
    });
}