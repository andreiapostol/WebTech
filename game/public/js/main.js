import Camera from './Camera.js';
import Timer from './Timer.js';
import {loadLevel, updateLevel, loadFont} from './loaders.js';
import {createMario} from './entities.js';import {setupKeyboard} from './input.js';
import {setupMouseControl} from './debugging.js';
import {generateDashboard, displayGameOver, resetScore} from './dashboard.js';
import { Trait } from './Entity.js';
import Go from './traits/Go.js';
import Jump from './traits/Jump.js';
import Perlin from './perlin.js';
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

    let perlinGenerator = new Perlin(Math.random());

    let nextInit = (400 - 400 / 5) / 250;

    let retrievedPerlin = perlinGenerator.getPerlin(1600,nextInit);
    nextInit = (retrievedPerlin[retrievedPerlin.length-1] - 400 / 5) / 250;

    console.log(retrievedPerlin);
    retrievedPerlin = perlinGenerator.getPerlin(1600, nextInit, 1600);
    nextInit = (retrievedPerlin[retrievedPerlin.length-1] - 400 / 5) / 250;
    
    retrievedPerlin = perlinGenerator.getPerlin(1600, nextInit, 3200);
    nextInit = (retrievedPerlin[retrievedPerlin.length-1] - 400 / 5) / 250;

    // retrievedPerlin = perlinGenerator.getPerlin(300, nextInit, 600);
    // maxRendered = Math.max(maxRendered)
    const camera = new Camera();
    window.camera = camera;
    mario.pos.set(50, 340);

    // level.comp.layers.push(createCollisionLayer(level), createCameraLayer(camera));
    const initialTiles = level.tileCollider.tiles.matrix;
    level.entities.add(mario);
    let savedEntities = level.entities;



    const timer = new Timer(1/60);
    let cameraAcceleration = 1.25;
    let i = 0;
    mario.gameOver = false;
    const input = setupKeyboard(mario);
    input.listenTo(window);
    timer.update = function update(deltaTime) {
        savedEntities = level.entities;
        if(mario.gameOver){
            level.comp.layers[4] = displayGameOver(font);
            level.comp.draw(context, camera);
            if(mario.pos.x === 50){
                camera.pos.x = 0;
                level.comp.layers[4] = function(){};
                mario.traits = [];
                mario.addTrait(new Go());
                mario.addTrait(new Jump());
                resetScore();
                mario.gameOver = false;
                level.tileCollider.tiles.setTiles(initialTiles);
            }
        }
        else{
            level.update(deltaTime);

        
            if((camera.pos.x + 656) / 16 >= level.tileCollider.tiles.matrix.grid.length){
                [level, levelSpecification, backgroundSprites] = updateLevel(level, levelSpecification, backgroundSprites, 100);
                level.entities = savedEntities;
            }
            
            // Game Over
            if(camera.pos.x > mario.pos.x + 20 || mario.traits.some(e => e.NAME === 'dead')){
                cameraAcceleration = 0;
                mario.gameOver = true;
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
                cameraAcceleration =  Math.min(Math.max(Math.floor(camera.pos.x / 500),1.25), 2.5);
            }
            
            camera.pos.x += cameraAcceleration;
            level.comp.layers[3] = generateDashboard(font, Math.floor(mario.pos.x / 30) - 1);
            level.comp.draw(context, camera);
            i++;
                    
        }
    }

    timer.start();
});