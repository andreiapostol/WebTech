import Level from './level.js';
import {createBackgroundLayer, createSpriteLayer } from './layers.js';
import {loadBackgroundSprites} from './sprites.js';

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

export function loadLevel(name){
    return Promise.all([
        fetch(`/levels/${name}.json`).then(result => result.json()),
        loadBackgroundSprites()
    ]).then(([levelSpecification, backgroundSprites]) => {
        const level = new Level();
        createTiles(level, levelSpecification.backgrounds);
        const backgroundLayer = createBackgroundLayer(level, backgroundSprites);
        level.comp.layers.push(backgroundLayer);
        const spriteLayer = createSpriteLayer(level.entities);
        level.comp.layers.push(spriteLayer);
        return level;
    });
}