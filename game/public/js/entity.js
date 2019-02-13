import {Vec2} from './math.js'
export default class Entity{
    constructor(){
        this.position = new Vec2(0, 0);
        this.velocity = new Vec2(0, 0);
    }
}