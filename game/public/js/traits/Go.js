import {Trait} from '../Entity.js';

export default class Go extends Trait {
    constructor() {
        super('go');

        this.dir = 0;
        this.speed = 7250;
        this.distance = 0;
        this.memory = 1;
    }

    update(entity, deltaTime) {
        entity.vel.x = this.speed * this.dir * deltaTime;
        this.distance = this.dir ? this.distance + Math.abs(entity.vel.x) * deltaTime : 0;
        this.memory = this.dir ? this.dir : this.memory;
    }
}
