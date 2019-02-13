import {Trait} from '../entity.js'

export default class Velocity extends Trait{
    constructor(){
        super('velocity');
    }

    update(entity, deltaTime){
        entity.position.x += entity.vel.x * deltaTime;
        entity.position.y += entity.vel.y * deltaTime;
    }
}