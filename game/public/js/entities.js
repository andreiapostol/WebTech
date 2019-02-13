import Entity from './Entity.js'
import {characterLoader} from './sprites.js';
import Jump from './traits/jump.js';
import Velocity from './traits/velocity.js';

export function createCario(){
    return characterLoader().then(sprite=>{
    const cario = new Entity();

    cario.addTrait(new Velocity());
    cario.addTrait(new Jump());

    cario.draw = function drawCario(context){
        sprite.draw('idle', context, this.position.x, this.position.y);
    }

    return cario;
    });
}