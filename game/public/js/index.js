import {mapLoader} from './loaders.js';
import {characterLoader, backgroundLoader} from './sprites.js';
import Compositor from './compositor.js';
import {createBackgroundLayer} from './layers.js';

const canvas = document.getElementById('screen');
const context = canvas.getContext('2d');

function createSpriteLayer(sprite, position){
    return function drawSpriteLayer(context){
        sprite.draw('idle', context, position.x, position.y);
    }
}

Promise.all([
    characterLoader(),
    backgroundLoader(),
    mapLoader('intro')
]).then(([ hero, backgroundSprites, level ]) => {
    const comp = new Compositor();
    const backgroundLayer = createBackgroundLayer(level, backgroundSprites);
    comp.layers.push(backgroundLayer);

    let pos = {
        x: 64,
        y: 64
    };
    const spriteLayer = createSpriteLayer(hero, pos);
    comp.layers.push(spriteLayer);

    function update(){
        comp.draw(context);
        hero.draw('idle', context, pos.x, pos.y);
        pos.x += 2;
        pos.y += 2;
        requestAnimationFrame(update);
    }
    update();
});