function writeText(font, string, context, x, y){
    [...string].forEach((caracter, index) => {
        font.draw(caracter, context, x + index * 8, y);
    })
}
let maxScore = 0;
export function generateDashboard(font, score){
    return function drawDashboard(context){
        if(score > maxScore){
            maxScore = score;
        }
        writeText(font, "SCORE:" + maxScore.toString().padStart(5, '0'), context, 550, 16);
    }
}