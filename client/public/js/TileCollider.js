import TileResolver from './TileResolver.js';
import { Trait } from './Entity.js';

export default class TileCollider {
    constructor(tileMatrix) {
        this.tiles = new TileResolver(tileMatrix);
    }

    addNewInfo(addedBackgrounds){
        this.tiles.addNewTiles(addedBackgrounds);
    }

    checkX(entity) {
        let x;
        if (entity.vel.x > 0) {
            x = entity.pos.x + entity.size.x;
        } else if (entity.vel.x < 0) {
            x = entity.pos.x;
        } else {
            return;
        }

        const matches = this.tiles.searchByRange(
            x, x,
            entity.pos.y, entity.pos.y + entity.size.y);

        matches.forEach(match => {
            if (match.tile.name === 'background') {
                return;
            }

            if (match.tile.name.includes('lava')) {
                entity.traits.push(new Trait('dead'));
                return;
            }

            if (entity.vel.x > 0) {
                if (entity.pos.x + entity.size.x > match.x1) {
                    entity.pos.x = match.x1 - entity.size.x;
                    entity.vel.x = 0;
                }
            } else if (entity.vel.x < 0) {
                if (entity.pos.x < match.x2) {
                    entity.pos.x = match.x2;
                    entity.vel.x = 0;
                }
            }

            if (match.tile.name.includes('powerUp')) {
                entity.traits.forEach(trait=>{
                    if(trait.NAME === 'jump'){
                        trait.godTime = 5;
                    };
                });
                return;
            }
        });
    }
    
    checkY(entity) {
        let y;
        if (entity.vel.y > 0) {
            y = entity.pos.y + entity.size.y;
        } else if (entity.vel.y < 0) {
            y = entity.pos.y;
        } else {
            return;
        }

        const matches = this.tiles.searchByRange(
            entity.pos.x, entity.pos.x + entity.size.x,
            y, y);
        
        matches.forEach(match => {
            if (match.tile.name === 'background') {
                return;
            }

            if (match.tile.name.includes('lava')) {
                entity.traits.push(new Trait('dead'));
                return;
            }

            if (entity.vel.y > 0) {
                if (entity.pos.y + entity.size.y > match.y1) {
                    entity.pos.y = match.y1 - entity.size.y;
                    entity.vel.y = 0;
                    entity.obstruct('bottom');
                }
            } else if (entity.vel.y < 0) {
                if (entity.pos.y < match.y2) {
                    entity.pos.y = match.y2;
                    entity.vel.y = 0;
                }
            }

            if (match.tile.name.includes('powerUp')) {
                entity.traits.forEach(trait=>{
                    if(trait.NAME === 'jump'){
                        trait.godTime = 5;
                    };
                });
                return;
            }
        });
    }
}
