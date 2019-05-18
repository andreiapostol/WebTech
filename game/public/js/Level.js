import Compositor from './Compositor.js';
import TileCollider from './TileCollider.js';

export default class Level {
    constructor() {
        this.gravity = 1750;
        this.time = 0;
        this.comp = new Compositor();
        this.entities = new Set();

        this.tileCollider = null;
    }

    createCollisionGrid(m){
        this.tileCollider = new TileCollider(m);
    }

    update(deltaTime) {
        this.entities.forEach(entity => {
            entity.update(deltaTime);

            entity.pos.x += entity.vel.x * deltaTime;
            this.tileCollider.checkX(entity);

            entity.pos.y += entity.vel.y * deltaTime;
            this.tileCollider.checkY(entity);

            entity.vel.y += this.gravity * deltaTime;
        });

        this.time += deltaTime;
    }
}
