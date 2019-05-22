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
    // if(camera.pos.x < (1600 + 992))
    //     return;
    // if(iter % 2 === 0)
    ctx.clearRect(0, 0, 124, 75);
    // ctx.fillRect(5,5, 10, 10 );

    // pozitia de start a camerei
    let start = camera.pos.x % (16 * generateLength);

    for(let i = 0; i < 124; i++){
        if(start > (1600-992) && previousPerlinNoise){
            if(start + i * 8 < 1600){
                ctx.fillRect(i, previousPerlinNoise[start + i * 8] / 8, 2, 2);
            }else{
                ctx.fillRect(i, currentPerlinNoise[start + i * 8 - 1600]/ 8, 2, 2);
            }
        }else{
            ctx.fillRect(i, currentPerlinNoise[start + i * 8]/8, 2, 2);
        }
    }
    
    // if(start > (1600 - 992) && previousPerlinNoise){
    //     // console.log('prev');
    //     // inseamna ca s-a generat deja noul nivel, in currentPerlinNoise
    //     // deci, de acum, cel putin un pixel trebuie sa fie
    //     // cat mai e pana la capat: (1600 - start) / 4 array-ul meu are size [124, 75]
    //     for(let i = start; i < 1600; i += 8){
    //         ctx.fillRect(Math.floor((i-start) * 0.125), previousPerlinNoise[i]/8, 2, 2);
    //     }
    //     // 1584 0, 1, 2 => (1600-1584) / 8p[0]
    //     for(let i = 1600; (i-start) / 8 < 124; i+=8){
    //         ctx.fillRect(Math.floor((i-start) * 0.125), currentPerlinNoise[i-1600]/8, 2, 2)
    //     }
    // }else{
    //     // console.log('current');
    //     for(let i = start; (i-start)/8 < 124; i+= 8){
    //         ctx.fillRect(Math.floor((i-start) * 0.125), currentPerlinNoise[i]/8, 2, 2);
    //     }
    // }

    // console.log(start);
    // if((start + 4 * 164 < 1600) && previousPerlinNoise){
    //     console.log('prev');
    //     let i;
    //     // start = 700
    //     // 0, n(700)
    //     // 1, n(704)
    //     // ...
    //     // 1600 - 992 = 900 / 4
    //     for(let i = start; i < 1600; i+=4)
    //         ctx.fillRect((i-start)/4, previousPerlinNoise[i]/4, 2, 2);
    //     for(let i = 0; (i+1600-start) < 164; i+=4)
    //         ctx.fillRect((i+ 1600 - start)/4, currentPerlinNoise[i]/4, 2, 2);
    // }else{
    //     console.log('current');
    //     for(let i = start; (i-start)/4 < 164; i+=4)
    //         ctx.fillRect((i-start)/4, currentPerlinNoise[i]/4, 2, 3);
    // }
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
        
            if((camera.pos.x + 992) / 16 >= level.tileCollider.tiles.matrix.grid.length){
                previousPerlinNoise = currentPerlinNoise;
                [level, levelSpecification, backgroundSprites, currentPerlinNoise] = updateLevel(level, levelSpecification, backgroundSprites, generateLength, perlinGenerator);
                level.entities = savedEntities;
            }
            
            // Game Over
            drawMap(camera, previousPerlinNoise, currentPerlinNoise, generateLength, iter);
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
        }
    }

    timer.start();
});