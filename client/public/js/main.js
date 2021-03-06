import Camera from './Camera.js';
import Timer from './Timer.js';
import { loadLevel, loadFont } from './loaders.js';
import { createMario } from './entities.js';
import { setupKeyboard } from './input.js';
import { setupMouseControl } from './debugging.js';
import { generateDashboard, displayGameOver, resetScore, displayPowerupJump } from './dashboard.js';
import { Trait } from './Entity.js';
import Go from './traits/Go.js';
import Jump from './traits/Jump.js';
import Perlin from './perlin.js';
import { updateLevel } from './generation.js';

// import {createNextTileMatrices} from '.'

const canvas = document.getElementById('screen');
const context = canvas.getContext('2d');
context.scale(1.5, 1.5);

const perlinCanvas = document.getElementById('perlin');
const ctx = perlinCanvas.getContext('2d');
ctx.fillStyle = 'white';

if (!localStorage.getItem('nickname')) {
    console.log("No nickname in local storage!");
    document.getElementById("overlay").classList.add("visible");
} else {
    console.log("Nickname: " + localStorage.getItem('nickname'));
    document.getElementsByClassName("container")[0].classList.add("visible");
    document.getElementsByTagName("nav")[0].classList.add("visible");
}
document.getElementById("formNickname").addEventListener("submit", submitNickname);

function submitNickname(event) {
    const e = document.getElementById("inputNickname").value;
    localStorage.setItem("nickname", e);
}

function drawMap(camera, previousPerlinNoise, currentPerlinNoise, generateLength, iter) {
    if (!previousPerlinNoise && !currentPerlinNoise)
        return;
    if (iter % 2 === 0)
        ctx.clearRect(0, 0, 164, 100);
    let start = camera.pos.x % (16 * generateLength);
    if ((start > 944) && previousPerlinNoise) {
        let i;
        for (i = start; i < previousPerlinNoise.length && i < start + 564; i += 4)
            ctx.fillRect((i - start) / 4, previousPerlinNoise[i] / 4, 3, 3);
        for (let j = 0; j / 4 + (i - start) / 4 < 564; j += 4)
            ctx.fillRect(j / 4 + (i - start) / 4, currentPerlinNoise[j] / 4, 3, 3);
    } else {
        for (let i = start; i < start + 564; i += 4)
            ctx.fillRect((i - start) / 4, currentPerlinNoise[i] / 4, 3, 3);
    }
};

function parsePathArguments(pathname){
    let object = {};
    // let firstAppearance = pathname.indexOf('?');
    pathname = pathname.substr(1, pathname.length-1);
    // pathname = pathname.substr(1, pathname.length-1);
    let splitUp = pathname.split('&');
    for(let i = 0; i < splitUp.length; i++){
        let keyValue = splitUp[i].split('=');
        if(keyValue && keyValue.length >= 2){
            object[keyValue[0]] = keyValue[1];
        }
    }
    return object;
};

function truncateTo3(num) {
    return num.toString().match(/^-?\d+(?:\.\d{0,3})?/)[0];

}

Promise.all([
        createMario(),
        loadLevel('intro'),
        loadFont()
    ])
    .then(([mario, [level, levelSpecification, backgroundSprites], font]) => {
        const parsedArgs = parsePathArguments(window.location.search);
        let seed;
        if(parsedArgs.seed){
            seed = truncateTo3(parseFloat(parsedArgs.seed));
        }else{
            seed = truncateTo3(Math.random());
        }
        console.log(seed);
        let perlinGenerator = new Perlin(seed);

        let recentMaps = JSON.parse(localStorage.getItem("recentMaps"));
        const currentdate = new Date();
        const now = currentdate.getDate() + "/" +
            (currentdate.getMonth() + 1) + "/" +
            currentdate.getFullYear() + " @ " +
            currentdate.getHours().toString().padStart(2, '0') + ":" +
            currentdate.getMinutes().toString().padStart(2, '0') + ":" +
            currentdate.getSeconds().toString().padStart(2, '0');
        if (recentMaps === null) {
            let temp = [];
            temp[0] = { seed: seed, time: now };
            localStorage.setItem("recentMaps", JSON.stringify(temp));
        } else {
            recentMaps.push({ seed: seed, time: now });
            // console.log(recentMaps);
            recentMaps = recentMaps.slice(-10);
            localStorage.setItem("recentMaps", JSON.stringify(recentMaps));
        }
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

        const timer = new Timer(1 / 60);
        let cameraAcceleration = 1.25;
        var iter = 0;
        mario.gameOver = false;
        const input = setupKeyboard(mario);
        input.listenTo(window);

        [level, levelSpecification, backgroundSprites, currentPerlinNoise] = updateLevel(level, levelSpecification, backgroundSprites, 100, perlinGenerator);
        [level, levelSpecification, backgroundSprites, currentPerlinNoise] = updateLevel(level, levelSpecification, backgroundSprites, 100, perlinGenerator);
        [level, levelSpecification, backgroundSprites, currentPerlinNoise] = updateLevel(level, levelSpecification, backgroundSprites, 100, perlinGenerator);
        [level, levelSpecification, backgroundSprites, currentPerlinNoise] = updateLevel(level, levelSpecification, backgroundSprites, 100, perlinGenerator);
        [level, levelSpecification, backgroundSprites, currentPerlinNoise] = updateLevel(level, levelSpecification, backgroundSprites, 100, perlinGenerator);
        [level, levelSpecification, backgroundSprites, currentPerlinNoise] = updateLevel(level, levelSpecification, backgroundSprites, 100, perlinGenerator);
        timer.update = function update(deltaTime) {
            savedEntities = level.entities;
            if (mario.traits.some(trait => trait.NAME === "jump" && trait.godTime > 0)) {
                level.comp.layers[5] = displayPowerupJump(font);
            } else {
                level.comp.layers[5] = function() {};
            }
            if (mario.gameOver) {
                level.comp.layers[4] = displayGameOver(font);
                level.comp.draw(context, camera);
                if (mario.pos.x === 50) {
                    camera.pos.x = 0;
                    level.comp.layers[4] = function() {};
                    mario.traits = [];
                    mario.addTrait(new Go());
                    mario.addTrait(new Jump());
                    resetScore();
                    mario.gameOver = false;
                    level.tileCollider.tiles.setTiles(initialTiles);
                }
            } else {
                level.update(deltaTime);

                if ((camera.pos.x + 656) / 16 >= level.tileCollider.tiles.matrix.grid.length) {
                    previousPerlinNoise = currentPerlinNoise;
                    [level, levelSpecification, backgroundSprites, currentPerlinNoise] = updateLevel(level, levelSpecification, backgroundSprites, generateLength, perlinGenerator);
                    level.entities = savedEntities;
                }

                // Game Over
                if (camera.pos.x > mario.pos.x + 20 || mario.pos.y > 26 * 16 || mario.traits.some(e => e.NAME === 'dead')) {
                    cameraAcceleration = 0;
                    mario.gameOver = true;
                }

                // Camera threshold right
                else if (mario.pos.x > camera.pos.x + 350) {
                    cameraAcceleration = 3.5;
                } else if (mario.pos.x < 150) {
                    cameraAcceleration = 0;
                }
                // Base case
                else {
                    cameraAcceleration = Math.min(Math.max(Math.floor(camera.pos.x / 500), 1.25), 2);
                }
                camera.pos.x = (camera.pos.x + cameraAcceleration);
                // if(camera.pos.x > 1600){
                //     camera.pos.x -= 1600;
                //     level.entities.forEach(entity=>{
                //         entity.pos.x -= 1600;
                //     })
                // }
                // console.log(camera.pos.x);
                level.comp.layers[3] = generateDashboard(font, Math.floor(mario.pos.x / 30) - 1);
                level.comp.draw(context, camera);
                iter++;
                // drawMap(camera, previousPerlinNoise, currentPerlinNoise, generateLength, iter);
            }
        }

        timer.start();
    });