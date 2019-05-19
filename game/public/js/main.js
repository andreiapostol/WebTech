import Camera from './Camera.js';
import Timer from './Timer.js';
import {loadLevel, createNextTileMatrices} from './loaders.js';
import {createMario} from './entities.js';import {setupKeyboard} from './input.js';
import {setupMouseControl} from './debugging.js';
// import {createNextTileMatrices} from '.'

const canvas = document.getElementById('screen');
const context = canvas.getContext('2d');
const maxRendered = 0;

Promise.all([
    createMario(),
    loadLevel('intro'),
])
.then(([mario, level]) => {
    console.log(mario);
    console.log(level);
    // maxRendered = Math.max(maxRendered)
    const camera = new Camera();
    window.camera = camera;
    mario.pos.set(50, 250);

    // level.comp.layers.push(createCollisionLayer(level), createCameraLayer(camera));

    level.entities.add(mario);

    const input = setupKeyboard(mario);
    input.listenTo(window);

    const timer = new Timer(1/60);
    let cameraAcceleration = 1.25;
    let i = 0;
    timer.update = function update(deltaTime) {
        // if(i % 250 == 0)
            // console.log(level);
        level.update(deltaTime);
        // console.log(mario.pos.x);
        if(mario.pos.x / 16 >= level.tileCollider.tiles.matrix.grid.length){
            console.log(mario.pos.x);
            level.tileCollider.tiles.matrix = createNextTileMatrices(level.tileCollider.tiles.matrix.grid.length-1, level.tileCollider.tiles.matrix);
            console.log(level);
        }
        // Game Over
        if(camera.pos.x > mario.pos.x + 20){
            // console.log("SCORE: " + Math.floor(camera.pos.x / 10));
            cameraAcceleration = 0;
        }
        // Camera threshold right
        else if(mario.pos.x > camera.pos.x + 500){
            cameraAcceleration = 4.4;
        }
        else if(mario.pos.x < 150){
            cameraAcceleration = 0;
        }
        // Base case
        else{
            cameraAcceleration = Math.min(Math.max(Math.floor(camera.pos.x / 500),1.25), 3.5);
        }
        camera.pos.x += cameraAcceleration;
        level.comp.draw(context, camera);
        i++;
    }

    timer.start();
});