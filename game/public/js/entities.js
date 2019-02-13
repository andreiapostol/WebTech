import Entity from './Entity.js'
import {characterLoader} from './sprites.js';

export function createCario(){
    return characterLoader().then(sprite=>{
    const cario = new Entity();

    cario.draw = function drawCario(context){
        sprite.draw('idle', context, this.position.x, this.position.y);
    }
    cario.update = function updateCario(deltaTime){
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
    }
    return cario;
    });
}