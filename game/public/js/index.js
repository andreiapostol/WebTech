import {mapLoader} from './loaders.js';
import Timer from './timer.js'
import {backgroundLoader} from './sprites.js';
import Compositor from './compositor.js';
import {createBackgroundLayer, createSpriteLayer } from './layers.js';
import {createCario} from './entities.js'
import {Vec2} from './math.js'
import Entity from './entity.js'

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

    const gravity = 30;
    cario.position.set(64, 180);
    cario.velocity.set(200, -600);

    const spriteLayer = createSpriteLayer(cario);
    comp.layers.push(spriteLayer);
    const timer = new Timer(1/60);
    const deltaTime = 1/60;
    // let accummulatedTime = 0;
    // let lastTime = 0;

    timer.update = function update(deltaTime){
        comp.draw(context);
        cario.update(deltaTime);
        cario.velocity.y += gravity;
    }
    // function update(time){
    //     accummulatedTime += (time - lastTime) / 1000;
    //     // console.log(deltaTime);
    //     while(accummulatedTime > deltaTime){
    //         comp.draw(context);
    //         //hero.draw('idle', context, pos.x, pos.y);
    //         cario.update(deltaTime);
    //         cario.velocity.y += gravity;
    //         accummulatedTime -= deltaTime;
    //     };
    //     // requestAnimationFrame(update);
    //     //setTimeout(update, 1000/14);
    //     setTimeout(update, 1000/1, performance.now());
    //     lastTime = time;
    //     console.log(cario.position, cario.velocity);
    // }
    timer.start();
    // update(0);
});