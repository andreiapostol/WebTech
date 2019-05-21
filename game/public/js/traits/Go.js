import {Trait} from '../Entity.js';

export default class Go extends Trait {
    constructor() {
        super('go');
        this.dir = 0;
        this.acceleration = 450;
        this.deceleration = 700;
        this.friction = 1/5000;
        this.distance = 0;
        this.memory = 1;
    }

    update(entity, deltaTime) {
        if(this.dir){
            entity.vel.x += this.acceleration * deltaTime * this.dir;
            this.memory = this.dir;
        }
        else if(entity.vel.x){
            entity.vel.x += entity.vel.x > 0 ? -Math.min(Math.abs(entity.vel.x), this.deceleration * deltaTime) : Math.min(Math.abs(entity.vel.x), this.deceleration * deltaTime);
        }
        else{
            this.distance = 0;
        }
        const drag = this.friction * entity.vel.x * Math.abs(entity.vel.x);
        entity.vel.x -= drag;
        this.distance += Math.abs(entity.vel.x) * deltaTime;

    }
    
    
}

