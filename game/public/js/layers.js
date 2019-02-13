function drawConstant(background, context, sprites){
    background.intervals.forEach(([x1, x2, y1, y2]) => {
        for(let x = x1; x < x2; x++){
            for(let y = y1; y < y2; y++){
                sprites.drawTile(background.tile, context, x, y);
            }
        }
    })
}

function drawAlternative(background, context, sprites){
    background.intervals.forEach(([x1, x2, y1, y2]) => {
        let step = 1;
        for(let x = x1; x < x2; x++){
            for(let y = y1; y < y2; y++){
                step === 1 ? sprites.drawTile(background.tileA, context, x, y) : sprites.drawTile(background.tileB, context, x, y);
                step *= -1;
            }
        }
    })
}

export function createBackgroundLayer(level, sprites){
    const backgroundBuffer = document.createElement('canvas');
    backgroundBuffer.width = 720;
    backgroundBuffer.height = 480;
    // bg
    drawConstant(level.backgrounds[0], backgroundBuffer.getContext('2d'), sprites);
    // floor
    drawAlternative(level.backgrounds[1], backgroundBuffer.getContext('2d'), sprites);
    // beneath the floor
    drawConstant(level.backgrounds[2], backgroundBuffer.getContext('2d'), sprites);
    return function drawBackgroundLayer(context){
        context.drawImage(backgroundBuffer, 0, 0);
    }
}