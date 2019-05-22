import {Trait} from '../Entity.js';

export default class Jump extends Trait {
    constructor() {
        super('jump');

        this.readyToJump = false;
        this.duration = 0.24;
        this.engageTime = 0;
        this.height = 0;;
        this.velocity = 350;
    }

    start() {
        if(this.readyToJump){
            this.engageTime = this.duration;
        }
    }

    cancel() {
        this.engageTime = 0;
        this.height = 0;
    }

    obstruct(entity, side){
        if(side === 'bottom'){
            this.readyToJump = true;
        }
    }


    update(entity, deltaTime) {
        if (this.engageTime > 0) {
            entity.vel.y = -this.velocity;
            this.height -= entity.vel.y;
            this.engageTime -= deltaTime;
        }
        this.readyToJump = false;
    }
}
