import Level from './level.js';
import SpriteSheet from './SpriteSheet.js';
import {createBackgroundLayer, createSpriteLayer } from './layers.js';
import { generateAnimationFromFrames } from './animation.js';

export function loadImage(url){
    return new Promise(resolve => {
        const image = new Image();
        image.addEventListener('load', ()=>{
            resolve(image);
        });
        image.src = url;
    })
}

function createTiles(level, backgrounds){
    backgrounds.forEach(background => {
        if(background.tile){
            background.intervals.forEach(([x1, x2, y1, y2]) => {
                for(let x = x1; x < x2; x++){
                    for(let y = y1; y < y2; y++){
                        level.tiles.set(x, y, {
                            name: background.tile
                        });
                    }
                }
            })
        }
        else{
            background.intervals.forEach(([x1, x2, y1, y2]) => {
                let step = 1;
                for(let x = x1; x < x2; x++){
                    for(let y = y1; y < y2; y++){
                        step === 1 ? level.tiles.set(x, y, {
                            name: background.tileA
                        }) : level.tiles.set(x, y, {
                            name: background.tileB
                        });;
                        step *= -1;
                    }
                }
            })
        }
    })
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
        loadSpriteSheet(levelSpec.spriteSheet),
    ])).then(([levelSpecification, backgroundSprites]) => {
        const level = new Level();
        createTiles(level, levelSpecification.backgrounds);
        const backgroundLayer = createBackgroundLayer(level, backgroundSprites);
        level.comp.layers.push(backgroundLayer);
        const spriteLayer = createSpriteLayer(level.entities);
        level.comp.layers.push(spriteLayer);
        return level;
    });
}