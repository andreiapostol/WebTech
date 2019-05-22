export default class SpriteSheet {
    constructor(image, width, height) {
        this.image = image;
        this.width = width;
        this.height = height;
        this.tiles = new Map();
        this.animations = new Map();
    }

    defineAnimation(name, animation){
        this.animations.set(name, animation);
    }

    define(name, x, y, width, height) {
        const buffers = [false, true].map(flip => {
            const buffer = document.createElement('canvas');
            buffer.width = width;
            buffer.height = height;
            const context = buffer.getContext('2d');
            if(flip){
                context.scale(-1, 1);
                context.translate(-width, 0);
            }
            context.drawImage(
                    this.image,
                    x,
                    y,
                    width,
                    height,
                    0,
                    0,
                    width,
                    height);
            return buffer;
        });

        this.tiles.set(name, buffers);
    }

    defineTile(name, x, y){
        this.define(name, x * this.width, y * this.height, this.width, this.height);
    }

    draw(name, context, x, y, flipped = false){
        const buffer = this.tiles.get(name)[flipped ? 1 : 0];
        context.drawImage(buffer, x, y);
    }

    drawTile(name, context, x, y){
        this.draw(name, context, x * this.width, y * this.height);
    }

    drawAnimation(name, context, x, y, distance){
        this.drawTile(this.animations.get(name)(distance), context, x, y);
    }
}
