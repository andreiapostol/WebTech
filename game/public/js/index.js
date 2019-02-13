import {mapLoader} from './loaders.js';
import Timer from './timer.js'
import {backgroundLoader} from './sprites.js';
import Compositor from './compositor.js';
import {createBackgroundLayer, createSpriteLayer } from './layers.js';
import {createCario} from './entities.js'
import {Vec2} from './math.js'
import Entity from './entity.js'
import Keyboard from './keyboardstate.js';

const canvas = document.getElementById('screen');
const context = canvas.getContext('2d');


Promise.all([
    createCario(),
    backgroundLoader(),
    mapLoader('intro')
]).then(([ cario, backgroundSprites, level ]) => {
    const comp = new Compositor();
    const backgroundLayer = createBackgroundLayer(level, backgroundSprites);
    comp.layers.push(backgroundLayer);

    const gravity = 2000;
    cario.position.set(50, 60);
    //cario.vel.set(200, -500);

    const spaceBar = 32;
    const input = new Keyboard();
    input.addMapping(spaceBar, keyState => {
        if(keyState){
            cario.jump.start();
        }
        else{
            cario.jump.cancel();
        }
    });
    input.listenTo(window);
    const spriteLayer = createSpriteLayer(cario);
    comp.layers.push(spriteLayer);
    const timer = new Timer(1/60);
    const deltaTime = 1/60;
    // let accummulatedTime = 0;
    // let lastTime = 0;

    timer.update = function update(deltaTime){
        cario.update(deltaTime);
        comp.draw(context);
        cario.vel.y += gravity * deltaTime;
    }
    timer.start();
    // update(0);
});