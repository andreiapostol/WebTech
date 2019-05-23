import Level from './level.js';
import {createBackgroundLayer, createSpriteLayer } from './layers.js';
import {createCollisionGrid, createTiles, createBackgroundGrid} from './loaders.js';

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

function getRandomBetweenValues(a, b, randomFunction){
    return Math.floor(randomFunction()*(b-a+1)+a);
}

function getPillarAtHeight(posAx, height, randomFunction, type){
    let intervals = [];
    let i;
    if(Math.floor(randomFunction()*101) % 10 != 0){
        for(i = height-1; i >= 0; i-=2){
            intervals.push([posAx, posAx+1, 24-i, 24-i+1]);
        }
        if(type === 'pattern')
            return {object: "box1W2H2", intervals: intervals};
        return [{object: "box2W2H2", intervals: intervals}];
    }else{
        for(i = height-3; i >= 0; i-=2){
            intervals.push([posAx, posAx+1, 24-i, 24-i+1]);
        }
        const powerupBox = {object: "powerupBox", intervals: [[posAx, posAx+1, 25-height, 26-height]]};
        if(type === 'pattern')
            return [powerupBox, {object: "box1W2H2", intervals: intervals}];
        return [powerupBox, {object: "box2W2H2", intervals: intervals}];
    }
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

function getHeightsAndPositionsBasedOnNoise(noiseInterval, startIndex, endIndex, edgeOffset, randomFunction){
    let heightPos = [];
    let startTile = startIndex / 16;
    let endTile = endIndex / 16;
    for(let i = startTile; i < endTile-1; i+=getRandomBetweenValues(4,9, randomFunction)){
        const currentHeight = 25 - noiseInterval[i*16] / 16;
        heightPos.push({xPosition:i+edgeOffset, height:Math.floor(currentHeight)});
    }
    return heightPos;
}

function getColumnTopBackgroundBetweenPositions(posAx, posBx){
    return {object: "columnTop", intervals:[[posAx, posBx, 3, 4]]};
}

function getPillarsBasedOnPositionsAndHeights(posHeights, randomFunction){
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
            pillars.push(...getPillarAtHeight(posHeights[i].xPosition, Math.floor(posHeights[i].height), randomFunction,'triangular'));
            // pillars.push(...getColumnAtHeight(posHeights[i].xPosition, Math.floor(posHeights[i].height), 2));
            let lavaHeight = posHeights[i].height < posHeights[i+1].height ? posHeights[i].height : posHeights[i+1].height;
            lavaUpperIntervals.push([posHeights[i].xPosition+2, posHeights[i+1].xPosition, 26-lavaHeight, 27-lavaHeight]);
            lavaMediumIntervals.push([posHeights[i].xPosition+2, posHeights[i+1].xPosition, 27-lavaHeight, 28-lavaHeight]);
            lavaBottomIntervals.push([posHeights[i].xPosition+2, posHeights[i+1].xPosition, 28-lavaHeight, 25]);
        }
    }

    pillars.push(...getPillarAtHeight(posHeights[posHeights.length-1].xPosition, Math.floor(posHeights[posHeights.length-1].height), randomFunction, 'triangular'));
    pillars.push({tileA: "lava00", tileB: "lava01", intervals:lavaUpperIntervals});
    pillars.push({tileA: "lava10", tileB: "lava11", intervals:lavaMediumIntervals});
    pillars.push({object: "lavaBottom", intervals:lavaBottomIntervals});

    return pillars;
}



export function updateLevel(oldLevel, oldLevelSpecification, oldBackgroundSprites, tilesNumber, noise){
    const level = new Level();
    const currentNoise = noise.getNextPerlinCurve(16 * tilesNumber);
    const allNewBackgrounds = [];

    level.entities = oldLevel.entities;
    const currentEdge = oldLevel.tileCollider.tiles.matrix.grid.length;
    let randFunction = _=>noise.ownRandom();
    
    const posHeights = getHeightsAndPositionsBasedOnNoise(currentNoise, 0, 16* tilesNumber, currentEdge, randFunction);
    // console.log(noise.ownRandom(), noise.ownRandom(), _=>noise.ownRandom());
    const pillars = getPillarsBasedOnPositionsAndHeights(posHeights, randFunction);

    let backgrounds = oldLevelSpecification.layers[0].backgrounds;
    let newBackgrounds = getBackgroundBetweenPositions(currentEdge, currentEdge + tilesNumber, 0, 25);
    let colTopBackground = getColumnTopBackgroundBetweenPositions(currentEdge, currentEdge+tilesNumber);
    let newFloorsAndUnderground = getFloorAndUndergroundBetweenPositions(currentEdge, currentEdge + tilesNumber, 23, 24);

    allNewBackgrounds.push(newBackgrounds, ...newFloorsAndUnderground, ...pillars)
    backgrounds.push(...allNewBackgrounds, colTopBackground);
    
    let objects = oldLevelSpecification.objects;
    const updatedCollisionGrid = createCollisionGrid([...allNewBackgrounds], objects);
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

    return [level, newLevelSpecification, newBackgroundSprites, currentNoise];

}