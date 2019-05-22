import Level from './level.js';
import SpriteSheet from './SpriteSheet.js';
import {createBackgroundLayer, createSpriteLayer } from './layers.js';
import {generateAnimationFromFrames} from './animation.js';
import {Matrix} from './math.js';
import Perlin from './perlin.js';

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

function getFloorAndUndergroundBetweenPositions(posAx, posBx, posAy, posBy){
    return [{tileA: "groundA", tileB: "groundB", intervals: [[posAx, posBx, posAy, posBy]]},
    {tile: "underground", intervals: [[posAx, posBx, posBy, posBy+1]]}];
    // return {tileA: "groundA", tileB: "groundB", intervals: [[posAx, posBx, posAy, posBy]]};
}

function getNormalBlockBetweenPositions(posAx, posBx, posAy, posBy){ 
    let allIntervals = [];
    for(let i = posAy; i < posBy; i+=2){
        allIntervals.push([posAx, posBx, i, i+1]);
    }
    return {object: "box2W2H2", intervals: allIntervals};
}

function getLavaBetweenPositions(posAx, posBx, posAy, posBy){
    let allLava = [];
    allLava.push({tileA: "lava00", tileB: "lava01", intervals:[[posAx, posBx, posAy, posAy+1]]});
    if(posBy - 1 > posAy)
        allLava.push({tileA: "lava10", tileB: "lava11", intervals:[[posAx, posBx, posAy+1, posAy+2]]});
    if(posBy - 2 > posAy)
        allLava.push({object: "lavaBottom", intervals:[[posAx, posBx, posAy+2, posBy]]});
    return allLava;
}

function getLavaAndBlocksBetweenPositions(posAx, posBx, height){
    let allObjects = [];
    if(posAx >= posBx - 4)
        return allObjects;
    allObjects.push(getNormalBlockBetweenPositions(posAx, posAx+1, 23 - height-1, 23));
    allObjects.push(...getLavaBetweenPositions(posAx + 2, posBx - 1, 25 - height, 25));
    allObjects.push(getNormalBlockBetweenPositions(posBx-1, posBx, 23 - height-1, 23));
    return allObjects;
}

function getTreeAtPosition(posAx, posAy){ 
    return {object: "tree", intervals: [[posAx, posAx + 1, posAy, posAy + 1]]};
}

function getRandomBetweenValues(a, b){
    return Math.floor(Math.random()*(b-a+1)+a);
}

function getPillarAtHeight(posAx, height, type){
    let intervals = [];
    let i;
    for(i = height-1; i >= 0; i-=2){
        intervals.push([posAx, posAx+1, 24-i, 24-i+1]);
    }
    // intervals.push([posAx, posAx+1, i, i+1])
    if(type === 'pattern')
        return {object: "box1W2H2", intervals: intervals};
    return {object: "box2W2H2", intervals: intervals};
}

function getColumnAtHeight(posAx, height, length){
    let allCols = [];
    allCols.push({tile: "columnForeground0", intervals: [[posAx, posAx+length, 25-height, 26-height]]});
    // if(height >= 4)
        allCols.push({tile: "columnForeground1", intervals: [[posAx, posAx+length, 26-height, 27-height]]});
    // if(height >= 4)
        allCols.push({tile: "columnForeground2", intervals: [[posAx, posAx+length, 27-height, 24]]});
    // if(height >= 4)
        allCols.push({tile: "columnForeground3", intervals: [[posAx, posAx+length, 24, 25]]});
    return allCols;
}

function getHeightsAndPositionsBasedOnNoise(noiseInterval, startIndex, endIndex, edgeOffset){
    let heightPos = [];
    let startTile = startIndex / 16;
    let endTile = endIndex / 16;
    for(let i = startTile; i < endTile-1; i+=getRandomBetweenValues(4,9)){
        const currentHeight = 25 - noiseInterval[i*16] / 16;
        heightPos.push({xPosition:i+edgeOffset, height:Math.floor(currentHeight)});
    }
    return heightPos;
}

function getColumnTopBackgroundBetweenPositions(posAx, posBx){
    return {object: "columnTop", intervals:[[posAx, posBx, 3, 4]]};
}

function getPillarsBasedOnPositionsAndHeights(posHeights){
    let pillars = [];
    let lavaUpperIntervals = [];
    let lavaMediumIntervals = [];
    let lavaBottomIntervals = [];

    for(let i = 0; i < posHeights.length-1; i++){
        let distanceToNext = posHeights[i+1].xPosition - posHeights[i].xPosition;
        if(distanceToNext < 7){
            pillars.push(...getColumnAtHeight(posHeights[i].xPosition, Math.floor(posHeights[i].height), 1));
            let lavaHeight = posHeights[i].height < posHeights[i+1].height ? posHeights[i].height : posHeights[i+1].height;
            lavaUpperIntervals.push([posHeights[i].xPosition+1, posHeights[i+1].xPosition, 26-lavaHeight, 27-lavaHeight]);
            lavaMediumIntervals.push([posHeights[i].xPosition+1, posHeights[i+1].xPosition, 27-lavaHeight, 28-lavaHeight]);
            lavaBottomIntervals.push([posHeights[i].xPosition+1, posHeights[i+1].xPosition, 28-lavaHeight, 25]);
        }else{
            pillars.push(getPillarAtHeight(posHeights[i].xPosition, Math.floor(posHeights[i].height), 'triangular'));
            // pillars.push(...getColumnAtHeight(posHeights[i].xPosition, Math.floor(posHeights[i].height), 2));
            let lavaHeight = posHeights[i].height < posHeights[i+1].height ? posHeights[i].height : posHeights[i+1].height;
            lavaUpperIntervals.push([posHeights[i].xPosition+2, posHeights[i+1].xPosition, 26-lavaHeight, 27-lavaHeight]);
            lavaMediumIntervals.push([posHeights[i].xPosition+2, posHeights[i+1].xPosition, 27-lavaHeight, 28-lavaHeight]);
            lavaBottomIntervals.push([posHeights[i].xPosition+2, posHeights[i+1].xPosition, 28-lavaHeight, 25]);
        }
    }

    pillars.push(getPillarAtHeight(posHeights[posHeights.length-1].xPosition, Math.floor(posHeights[posHeights.length-1].height), 'triangular'));
    pillars.push({tileA: "lava00", tileB: "lava01", intervals:lavaUpperIntervals});
    pillars.push({tileA: "lava10", tileB: "lava11", intervals:lavaMediumIntervals});
    pillars.push({object: "lavaBottom", intervals:lavaBottomIntervals});

    return pillars;
}



export function updateLevel(oldLevel, oldLevelSpecification, oldBackgroundSprites, tilesNumber, noise){
    const level = new Level();
    const currentNoise = noise.getNextPerlinCurve(1600);
    const allNewBackgrounds = [];

    level.entities = oldLevel.entities;
    const currentEdge = oldLevel.tileCollider.tiles.matrix.grid.length;
    
    const posHeights = getHeightsAndPositionsBasedOnNoise(currentNoise, 0, 1600, currentEdge);
    const pillars = getPillarsBasedOnPositionsAndHeights(posHeights, tilesNumber);

    let backgrounds = oldLevelSpecification.layers[0].backgrounds;
    console.log(oldLevelSpecification);
    console.log(oldBackgroundSprites);
    let newBackgrounds = getBackgroundBetweenPositions(currentEdge, currentEdge + tilesNumber, 0, 25);
    let colTopBackground = getColumnTopBackgroundBetweenPositions(currentEdge, currentEdge+tilesNumber);
    let newFloorsAndUnderground = getFloorAndUndergroundBetweenPositions(currentEdge, currentEdge + tilesNumber, 23, 24);

    allNewBackgrounds.push(newBackgrounds, ...newFloorsAndUnderground, ...pillars)
    backgrounds.push(...allNewBackgrounds, colTopBackground);
    
    let objects = oldLevelSpecification.objects;
    const updatedCollisionGrid = createCollisionGrid([...allNewBackgrounds], objects);
    console.log(oldLevel.tileCollider.tiles.matrix.grid);
    console.log(updatedCollisionGrid);
    oldLevel.updateCollisionGrid(updatedCollisionGrid);
    level.tileCollider = oldLevel.tileCollider;
    
    oldLevelSpecification.layers.forEach(layer => {
        const backgroundGrid = createBackgroundGrid(layer.backgrounds, oldLevelSpecification.objects);
        const backgroundLayer = createBackgroundLayer(level, backgroundGrid, oldBackgroundSprites);
        level.comp.layers.push(backgroundLayer);
    });

    // backgrounds = allNewBackgrounds;
    const spriteLayer = createSpriteLayer(level.entities);
    level.comp.layers.push(spriteLayer);

    let newLevelSpecification = {};
    newLevelSpecification.layers = oldLevelSpecification.layers;
    newLevelSpecification.objects = objects;
    newLevelSpecification.spriteSheet = oldLevelSpecification.spriteSheet;

    let newBackgroundSprites = oldBackgroundSprites;

    console.log(level);

    return [level, newLevelSpecification, newBackgroundSprites, currentNoise];

}

function createTiles(backgrounds, objects, offsetX = 0, offsetY = 0){
    let tiles = [];
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
    return tiles;
}

    // let tree = getTreeAtPosition(currentEdge + 10, 17);
    // let pillar = getPillarAtHeight(currentEdge + 14, 8);

    // let lavaAndBlocks = getLavaAndBlocksBetweenPositions(lavaBeginning, lavaBeginning + lavaIntervalSize, lavaIntervalHeight);


    // backgrounds.push(tree);
    // backgrounds.push(pillar);
    // backgrounds.push(...lavaAndBlocks);
    // const lavaIntervalSize = getRandomBetweenValues(8, 12);
    // const lavaIntervalHeight = getRandomBetweenValues(2, 5);
    // const lavaBeginning = getRandomBetweenValues(currentEdge, currentEdge + tilesNumber - lavaIntervalSize);


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
        const collisionGrid = createCollisionGrid(levelSpecification.layers[0].backgrounds, levelSpecification.objects);
        level.createCollisionGrid(collisionGrid);
        levelSpecification.layers.forEach(layer => {
            const backgroundGrid = createBackgroundGrid(layer.backgrounds, levelSpecification.objects);
            const backgroundLayer = createBackgroundLayer(level, backgroundGrid, backgroundSprites);
            level.comp.layers.push(backgroundLayer);
        });
        const spriteLayer = createSpriteLayer(level.entities);
        level.comp.layers.push(spriteLayer);
        return [level, levelSpecification, backgroundSprites];
    });
}