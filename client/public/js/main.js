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
context.scale(1.5, 1.5);

const perlinCanvas = document.getElementById('perlin');
const ctx = perlinCanvas.getContext('2d');
ctx.fillStyle = 'white';


function drawMap(camera, previousPerlinNoise, currentPerlinNoise, generateLength, iter){
	    if(!previousPerlinNoise && !currentPerlinNoise)
	        return;
	    if(iter % 2 === 0)
	        ctx.clearRect(0, 0, 164, 100);
	    let start = camera.pos.x % (16 * generateLength);
	    if((start > 944) && previousPerlinNoise){
            let i;
	        for(i = start; i < previousPerlinNoise.length && i < start + 564; i+=4)
	            ctx.fillRect((i-start)/4, previousPerlinNoise[i]/4, 3, 3);
	        for(let j = 0; j/4 + (i - start)/4 < 564; j+=4)
	            ctx.fillRect(j/4 + (i - start)/4, currentPerlinNoise[j]/4, 3, 3);
	    }else{
	        for(let i = start; i < start + 564; i+=4)
	            ctx.fillRect((i-start)/4, currentPerlinNoise[i]/4, 3, 3);
	    }
};

Promise.all([
    createMario(),
    loadLevel('intro'),
    loadFont()
])
.then(([mario, [level,levelSpecification,backgroundSprites], font]) => {

    let perlinGenerator = new Perlin(Math.random());
    let currentPerlinNoise = undefined;
    let previousPerlinNoise = undefined;
    const generateLength = 100;
    // let retrievedPerlin = perlinGenerator.getNextPerlinCurve(1600);
    const camera = new Camera();
    window.camera = camera;
    mario.pos.set(50, 340);

    // level.comp.layers.push(createCollisionLayer(level), createCameraLayer(camera));
    const initialTiles = level.tileCollider.tiles.matrix;
    level.entities.add(mario);
    let savedEntities = level.entities;

    const timer = new Timer(1/60);
    let cameraAcceleration = 1.25;
    var iter = 0;
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
                previousPerlinNoise = currentPerlinNoise;
                [level, levelSpecification, backgroundSprites, currentPerlinNoise] = updateLevel(level, levelSpecification, backgroundSprites, generateLength, perlinGenerator);
                level.entities = savedEntities;
            }
            
            // Game Over
            if(camera.pos.x > mario.pos.x + 20 || mario.traits.some(e => e.NAME === 'dead')){
                cameraAcceleration = 0;
                mario.gameOver = true;
            }
            // Camera threshold right
            else if(mario.pos.x > camera.pos.x + 350){
                cameraAcceleration = 3.5;
            }
            else if(mario.pos.x < 150){
                cameraAcceleration = 0;
            }
            // Base case
            else{
                cameraAcceleration =  Math.min(Math.max(Math.floor(camera.pos.x / 500),1.25), 2);
            }
            camera.pos.x += cameraAcceleration;
            level.comp.layers[3] = generateDashboard(font, Math.floor(mario.pos.x / 30) - 1);
            level.comp.draw(context, camera);
            iter++;
            // drawMap(camera, previousPerlinNoise, currentPerlinNoise, generateLength, iter);
        }
    }

    timer.start();
});