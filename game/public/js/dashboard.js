function writeText(font, string, context, x, y){
    [...string].forEach((caracter, index) => {
        font.draw(caracter, context, x + index * 8, y);
    })
}
export function generateDashboard(font, score){
    return function drawDashboard(context){
        writeText(font, "SCORE:" + score.toString().padStart(5, '0'), context, 550, 16);
    }
}