function writeText(font, string, context, x, y) {
    [...string].forEach((caracter, index) => {
        font.draw(caracter, context, x + index * 8, y);
    })
}
let maxScore = 0;
let called = 0;
export function resetScore() {
    maxScore = 0;
    called = 0;
}

export function generateDashboard(font, score) {
    return function drawDashboard(context) {
        if (score > maxScore) {
            maxScore = score;
        }
        writeText(font, localStorage.getItem('nickname').toUpperCase(), context, 20, 16);
        writeText(font, "SCORE:" + maxScore.toString().padStart(5, '0'), context, 550, 16);
    }
}

export function displayPowerupJump(font) {
    return function drawDashboard(context) {
        writeText(font, "INFINITE JUMPS!", context, 265, 60);
    }
}


export function displayGameOver(font) {
    return function drawGameOver(context) {
        if (!called) {
            const obj = { name: localStorage.getItem("nickname"), score: maxScore };
            console.log(obj);
            fetch('http://localhost:3001/submitScore', {
                    method: 'POST', // *GET, POST, PUT, DELETE, etc.
                    mode: 'cors', // no-cors, cors, *same-origin
                    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                    credentials: 'same-origin', // include, *same-origin, omit
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    redirect: 'follow', // manual, *follow, error
                    referrer: 'no-referrer', // no-referrer, *client
                    body: JSON.stringify(obj), // body data type must match "Content-Type" header
                })
                .then(response => console.log(response.json()));
            called = 1;
        }
        writeText(font, "GAME OVER!", context, 290, 190);
        writeText(font, "PRESS SPACEBAR TO RETRY.", context, 238, 206);
    }

}