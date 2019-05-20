import Level from './level.js';
import SpriteSheet from './SpriteSheet.js';
import {createBackgroundLayer, createSpriteLayer } from './layers.js';
import {generateAnimationFromFrames} from './animation.js';
import {Matrix} from './math.js';

export function loadImage(url){
    return new Promise(resolve => {
        const image = new Image();
        image.addEventListener('load', ()=>{
            resolve(image);
        });
        image.src = url;
    })
}

export function loadFont(){
    return loadImage('./img/font.png').then(font => {
        let temp = new SpriteSheet(font);
        const hack = ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~';
        for(let [index, caracter] of [...hack].entries()){
            temp.define(caracter, index * 8 % font.width, Math.floor(index * 8 / font.width) * 8, 8, 8);
        }
        return temp;
    });
}

function createCollisionGrid(backgrounds, objects){
    const layer = new Matrix();
    const createdTiles = createTiles(backgrounds, objects);
    console.log(createdTiles);
    for(const {name, x, y} of createdTiles){
        layer.set(x, y, {
            name: name
        });
    }
    return layer;
}

function createBackgroundGrid(backgrounds, objects){
    const layer = new Matrix();
    for(const {name, x, y} of createTiles(backgrounds, objects)){
        layer.set(x, y, {
            name: name
        });
    }
    return layer;
}

function getBackgroundBetweenPositions(posAx, posBx, posAy, posBy){
    return {tile: "background", intervals: [[posAx, posBx, posAy, posBy]]};
}

function getFloorBetweenPositions(posAx, posBx, posAy, posBy){
    return {tileA: "groundA", tileB: "groundB", intervals: [[posAx, posBx, posAy, posBy]]};
}
export function updateLevel(oldLevel, oldLevelSpecification, oldBackgroundSprites){
    // const newCollisionGrid = 
    const level = new Level();
    level.entities = oldLevel.entities;

    const currentEdge = oldLevel.tileCollider.tiles.matrix.grid.length;

    let backgrounds = oldLevelSpecification.layers[0].backgrounds;
    let newBackgrounds = getBackgroundBetweenPositions(currentEdge, currentEdge + 100, 0, 25);
    let newFloors = getFloorBetweenPositions(currentEdge, currentEdge + 100, 23, 24);

    backgrounds.push(newBackgrounds);
    backgrounds.push(newFloors);
    
    let objects = oldLevelSpecification.objects;

    // const collisionGrid = createCollisionGrid(backgrounds, objects);
    // level.createCollisionGrid(collisionGrid);

    const updatedCollisionGrid = createCollisionGrid([newBackgrounds, newFloors], objects);
    console.log(updatedCollisionGrid);
    console.log(oldLevel.tileCollider);
    oldLevel.updateCollisionGrid(updatedCollisionGrid);
    console.log(oldLevel.tileCollider);
    level.tileCollider = oldLevel.tileCollider;
    
    oldLevelSpecification.layers.forEach(layer => {
        const backgroundGrid = createBackgroundGrid(layer.backgrounds, oldLevelSpecification.objects);
        const backgroundLayer = createBackgroundLayer(level, backgroundGrid, oldBackgroundSprites);
        level.comp.layers.push(backgroundLayer);
    });
    const spriteLayer = createSpriteLayer(level.entities);
    level.comp.layers.push(spriteLayer);

    let newLevelSpecification = {};
    newLevelSpecification.layers = oldLevelSpecification.layers;
    newLevelSpecification.objects = objects;
    newLevelSpecification.backgrounds = backgrounds;

    let newBackgroundSprites = oldBackgroundSprites;


    return [level, newLevelSpecification, newBackgroundSprites];

}
// export function createNextCollisionGrid(startAtX, layer){
//     for(const {name, x, y} of generateNextTiles("background", startAtX, startAtX + 50)){
//         layer.set(x, y, {
//             name: name
//         });
//     }
//     return layer;
// }

// function generateNextTiles(defaultBackground, startAtX, endAtX){
//     let tiles = [];
//     for(let i = startAtX; i < endAtX; i++){
//         for(let j = 0; j < 25; j++){
//             tiles.push({x: i, y: j, name: defaultBackground});
//         }
//     }
//     return tiles;
// }

function createTiles(backgrounds, objects, offsetX = 0, offsetY = 0){
    let tiles = [];
    // console.log('Backgrounds', backgrounds);
    // console.log('Objects', objects);
    backgrounds.forEach(background => {
        if(background.object){
            background.intervals.forEach(([x1, x2, y1, y2]) => {
                for(let x = x1; x < x2; x++){
                    for(let y = y1; y < y2; y++){
                        const createdBackgrounds = objects[background.object].backgrounds;
                        tiles = tiles.concat(createTiles(createdBackgrounds, objects, x + offsetX, y + offsetY));
                    }
                }
            });
        }
        else if(background.tile){
            background.intervals.forEach(([x1, x2, y1, y2]) => {
                for(let x = x1; x < x2; x++){
                    for(let y = y1; y < y2; y++){
                        let obj = {name: background.tile, x: x + offsetX, y : y + offsetY};
                        tiles.push(obj);
                    }
                }
            })
        }
        else{
            background.intervals.forEach(([x1, x2, y1, y2]) => {
                let step = 1;
                for(let x = x1; x < x2; x++){
                    for(let y = y1; y < y2; y++){
                        let obj = {x: x + offsetX, y: y + offsetY}
                        step === 1 ? obj.name = background.tileA : obj.name = background.tileB;
                        step *= -1;
                        tiles.push(obj);
                    }
                }
            })
        }
    });
    // tiles.push({x: 2, y: 2, name: 'lava01'});
    // tiles.push({x: 2, y: 3, name: 'lava00'});
    // console.log(tiles);
    return tiles;
}

function loadJSON(url) {
    return fetch(url)
    .then(r => r.json());
}

export function loadSpriteSheet(name) {
    return loadJSON(`/sprites/${name}.json`)
    .then(sheetSpec => Promise.all([
        sheetSpec,
        loadImage(sheetSpec.imageURL),
    ]))
    .then(([sheetSpec, image]) => {
        const sprites = new SpriteSheet(
            image,
            sheetSpec.tileW,
            sheetSpec.tileH);
        if(sheetSpec.tiles){
            sheetSpec.tiles.forEach(tileSpec => {
                sprites.defineTile(
                    tileSpec.name,
                    tileSpec.index[0],
                    tileSpec.index[1]);
            });
        }
        if(sheetSpec.frames){
            sheetSpec.frames.forEach(frameSpec => {
                sprites.define(frameSpec.name, ...frameSpec.rect);
            })
        }
        if(sheetSpec.animations){
            sheetSpec.animations.forEach(animationSpec => {
                sprites.defineAnimation(animationSpec.name,  generateAnimationFromFrames(animationSpec.frames, animationSpec.rate));
            })
        }

        return sprites;
    });
}


export function loadLevel(name){
    return loadJSON(`/levels/${name}.json`)
    .then(levelSpec => Promise.all([
        levelSpec,
        loadSpriteSheet(levelSpec.spriteSheet)
    ])).then(([levelSpecification, backgroundSprites]) => {
        const level = new Level();
        console.log(levelSpecification.layers[0].backgrounds, levelSpecification.objects);
        const collisionGrid = createCollisionGrid(levelSpecification.layers[0].backgrounds, levelSpecification.objects);
        level.createCollisionGrid(collisionGrid);
        levelSpecification.layers.forEach(layer => {
            console.log(layer.backgrounds, levelSpecification.objects);
            const backgroundGrid = createBackgroundGrid(layer.backgrounds, levelSpecification.objects);
            const backgroundLayer = createBackgroundLayer(level, backgroundGrid, backgroundSprites);
            level.comp.layers.push(backgroundLayer);
        });
        console.log('Before', level.entities);
        const spriteLayer = createSpriteLayer(level.entities);
        level.comp.layers.push(spriteLayer);
        console.log('After', level.entities);
        return [level, levelSpecification, backgroundSprites];
    });
}