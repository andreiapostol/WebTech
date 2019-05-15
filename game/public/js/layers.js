export function createBackgroundLayer(level, sprites) {
    const tiles = level.tiles;
    const resolver = level.tileCollider.tiles;
    const buffer = document.createElement('canvas');
    buffer.width = 4096;
    buffer.height = 480;

    const context = buffer.getContext('2d');

    let start, end;
    function redraw(from, to){
        start = from;
        end = to;
        for(let x = start; x <= end; x++){
            const col = tiles.grid[x];
            if(col){
                col.forEach((tile, y) => {
                    if(sprites.animations.has(tile.name)){
                        sprites.drawAnimation(tile.name, context, x - start, y, level.time);
                    }
                    else{
                        sprites.drawTile(tile.name, context, x - start, y);
                    }
                });
            }
        }
    }

    level.tiles.forEach((tile, x, y) => {
        sprites.drawTile(tile.name, context, x, y);
    });

    return function drawBackgroundLayer(context, camera) {
        const drawWidth = resolver.toIndex(camera.size.x);
        const drawFrom = resolver.toIndex(camera.pos.x);
        const drawTo = drawFrom + drawWidth;
        redraw(drawFrom, drawTo);
        context.drawImage(buffer, -camera.pos.x % 16, -camera.pos.y);
    };
}

export function createSpriteLayer(entities, width = 64, height = 64) {
    const spriteBuffer = document.createElement('canvas');
    spriteBuffer.width = width;
    spriteBuffer.height = height;
    const spriteBufferContext = spriteBuffer.getContext('2d');
    return function drawSpriteLayer(context, camera) {
        entities.forEach(entity => {
            spriteBufferContext.clearRect(0, 0, width, height);
            entity.draw(spriteBufferContext);
            context.drawImage(spriteBuffer, entity.pos.x - camera.pos.x, entity.pos.y - camera.pos.y)
        });
    };
}

export function createCollisionLayer(level) {
    const resolvedTiles = [];

    const tileResolver = level.tileCollider.tiles;
    const tileSize = tileResolver.tileSize;

    const getByIndexOriginal = tileResolver.getByIndex;
    tileResolver.getByIndex = function getByIndexFake(x, y) {
        resolvedTiles.push({x, y});
        return getByIndexOriginal.call(tileResolver, x, y);
    }

    return function drawCollision(context, camera) {
        context.strokeStyle = 'blue';
        resolvedTiles.forEach(({x, y}) => {
            context.beginPath();
            context.rect(
                x * tileSize - camera.pos.x,
                y * tileSize - camera.pos.y,
                tileSize, tileSize);
            context.stroke();
        });

        context.strokeStyle = 'red';
        level.entities.forEach(entity => {
            context.beginPath();
            context.rect(
                entity.pos.x - camera.pos.x, entity.pos.y,
                entity.size.x - camera.pos.y, entity.size.y);
            context.stroke();
        });

        resolvedTiles.length = 0;
    };
}

export function createCameraLayer(toCamera){
    return function drawCameraRect(context, fromCamera){
        context.strokeStyle = 'purple';
        context.beginPath();
        context.rect(toCamera.pos.x - fromCamera.pos.x, toCamera.pos.y - fromCamera.pos.y,
            toCamera.size.x, toCamera.size.y);
        context.stroke();
    }
}