import SpriteSheet from './SpriteSheet.js';
import {loadImage} from './loaders.js';

export function loadMarioSprite() {
    return loadImage('/img/hero.png')
    .then(image => {
        const sprites = new SpriteSheet(image, 37, 37);
        sprites.define('idle', 15, 5, 20, 30);
        return sprites;
    });
}

export function loadBackgroundSprites() {
    return loadImage('/img/inca_back.png')
    .then(image => {
        const sprites = new SpriteSheet(image, 16, 16);
        sprites.defineTile('background', 7, 13);
        sprites.defineTile('groundA', 2, 4);
        sprites.defineTile('groundB', 3, 4);
        sprites.defineTile('underground', 2, 11);
        return sprites;
    });
}
