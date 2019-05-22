import Keyboard from './KeyboardState.js';

export function setupKeyboard(entity) {
    const input = new Keyboard();

    input.addMapping('KeyX', keyState => {
        if (keyState) {
            entity.jump.start();
        } else {
            entity.jump.cancel();
        }
        
    });

    input.addMapping('Space', keyState => {
        if (keyState && entity.gameOver) {
            entity.pos.set(50, 340);
            input.keyStates = new Map();
        }
    });

    input.addMapping('ArrowRight', keyState => {
        entity.go.dir += keyState ? 1 : -1;
    });

    input.addMapping('ArrowLeft', keyState => {
        entity.go.dir += keyState ? -1 : 1;
    });

    return input;
}
