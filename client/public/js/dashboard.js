function writeText(font, string, context, x, y){
    [...string].forEach((caracter, index) => {
        font.draw(caracter, context, x + index * 8, y);
    })
}
let maxScore = 0;
let called = 0;
export function resetScore(){
    maxScore = 0;
    called = 0;
}

export function generateDashboard(font, score){
    return function drawDashboard(context){
        if(score > maxScore){
            maxScore = score;
        }
        writeText(font, "SCORE:" + maxScore.toString().padStart(5, '0'), context, 550, 16);
    }
}


export function displayGameOver(font){
    return function drawGameOver(context){
        if(!called){
            console.log("GAME OVER. SCORE: " + maxScore);
            called = 1;
        }
        writeText(font, "GAME OVER!", context, 290, 190);
        writeText(font, "PRESS SPACEBAR TO RETRY.", context, 238, 206);
    }
  
}