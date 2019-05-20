import Camera from './Camera.js';
import Timer from './Timer.js';
import {loadLevel, updateLevel, loadFont} from './loaders.js';
import {createMario} from './entities.js';import {setupKeyboard} from './input.js';
import {setupMouseControl} from './debugging.js';
import {generateDashboard, displayGameOver} from './dashboard.js';
import { Trait } from './Entity.js';
// import {createNextTileMatrices} from '.'

const canvas = document.getElementById('screen');
const context = canvas.getContext('2d');
const maxRendered = 0;

Promise.all([
    createMario(),
    loadLevel('intro'),
    loadFont()
])
.then(([mario, [level,levelSpecification,backgroundSprites], font]) => {
    console.log(mario);
    console.log(level);
    // maxRendered = Math.max(maxRendered)
    const camera = new Camera();
    window.camera = camera;
    mario.pos.set(50, 250);

    // level.comp.layers.push(createCollisionLayer(level), createCameraLayer(camera));

    level.entities.add(mario);
    let savedEntities = level.entities;

    const input = setupKeyboard(mario);
    input.listenTo(window);

    const timer = new Timer(1/60);
    let cameraAcceleration = 1.25;
    let i = 0;
    let gameOver = false;
    timer.update = function update(deltaTime) {
        savedEntities = level.entities;
        if(gameOver){
            level.comp.layers[4] = displayGameOver(font);
            level.comp.draw(context, camera);
            return;
            
        }
        else{
            level.update(deltaTime);

        
            if((camera.pos.x + 650) / 16 >= level.tileCollider.tiles.matrix.grid.length){
                [level, levelSpecification, backgroundSprites] = updateLevel(level, levelSpecification, backgroundSprites);
                level.entities = savedEntities;
                console.log(level);
            }
            
            // Game Over
            if(camera.pos.x > mario.pos.x + 20 || mario.traits.some(e => e.NAME === 'dead')){
                cameraAcceleration = 0;
                gameOver = true;
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
                cameraAcceleration =    Math.min(Math.max(Math.floor(camera.pos.x / 500),1.25), 3.5);
            }
            
            camera.pos.x += cameraAcceleration;
            level.comp.layers[3] = generateDashboard(font, Math.floor(mario.pos.x / 100) - 1);
            level.comp.draw(context, camera);
            i++;
                    
        }
    }

    timer.start();
});