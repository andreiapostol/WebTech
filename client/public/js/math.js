export class Matrix {
    constructor() {
        this.grid = [];
    }

    forEach(callback) {
        this.grid.forEach((column, x) => {
            column.forEach((value, y) => {
                callback(value, x, y);
            });
        });
    }

    get(x, y) {
        const col = this.grid[x];
        if (col) {
            return col[y];
        }
        return undefined;
    }

    set(x, y, value) {
        if (!this.grid[x]) {
            this.grid[x] = [];
        }

        this.grid[x][y] = value;
    }

    concatMatrix(otherMatrix){
        for(let i = this.grid.length; i < otherMatrix.grid.length; i++)
            this.grid[i] = otherMatrix.grid[i];
        // this.grid = this.grid.concat(otherMatrix.grid);
    }
}

export class Vec2 {
    constructor(x, y) {
        this.set(x, y);
    }

    set(x, y) {
        this.x = x;
        this.y = y;
    }
}

export function copyMatrixValues(a){
    let temp = new Matrix();
    for(let i = 0; i < a.grid.length; i++){
        for(let j = 0; j < a.grid[i].length; j++){
            temp.set(i, j, a.get(i, j));
        }
    }
    return temp;
}