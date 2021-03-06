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

export function createCollisionGrid(backgrounds, objects){
    const layer = new Matrix();
    const createdTiles = createTiles(backgrounds, objects);
    for(const {name, x, y} of createdTiles){
        layer.set(x, y, {
            name: name
        });
    }
    return layer;
}

export function createBackgroundGrid(backgrounds, objects){
    const layer = new Matrix();
    for(const {name, x, y} of createTiles(backgrounds, objects)){
        layer.set(x, y, {
            name: name
        });
    }
    return layer;
}

export function createTiles(backgrounds, objects, offsetX = 0, offsetY = 0){
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