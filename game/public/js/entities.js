import Entity from './Entity.js';
import Go from './traits/Go.js';
import Jump from './traits/Jump.js';
import {loadSpriteSheet} from './loaders.js';
import {generateAnimationFromFrames} from './animation.js'

export function createMario() {
    return loadSpriteSheet('hero')
    .then(sprite => {
        const mario = new Entity();
        mario.size.set(20,30);

        mario.addTrait(new Go());
        mario.addTrait(new Jump());

        const runAnimation = generateAnimationFromFrames(['run-1', 'run-2', 'run-3', 'run-4', 'run-5', 'run-6'], 15);

        function frameDecider(mario){
            if(mario.go.dir !== 0){
                return runAnimation(mario.go.distance);
            }
            return 'idle';
        }

        mario.draw = function drawMario(context) {
            sprite.draw(frameDecider(this), context, 0, 0, this.go.memory < 0);
        }

        return mario;
    });
}