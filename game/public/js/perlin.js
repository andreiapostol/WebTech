export default class Perlin {
    constructor(seed){
        this.seed = seed || Math.random();
        this.M = 4294967296;
        this.A = 1664525;
        this.C = 1;
        this.Z = Math.floor(this.seed * this.M);
        this.h = 400;
        this.amp = 250;
        this.wl = 800;
        this.fq = 1 / this.wl;
        this.createNewInit(this.h - 3 * 16);
    }

    getWavelength(){
        return this.wl;
    }

    createNewInit(requiredY){
        // y = h / 2 + a * amp;
        // a = (y - h / 2) / amp;
        this.init = (requiredY - this.h / 4) / this.amp;
    }

    ownRandom(){
        this.Z = (this.A * this.Z + this.C) % this.M;
        return this.Z / this.M;
    }

    interpolate(pa, pb, px){
        let ft = px * Math.PI,
            f = (1 - Math.cos(ft)) * 0.5;
        return pa * (1 - f) + pb * f;
    }

    getNextPerlinCurve(len, offset){
        let x = 0,
        y = this.h / 2,
        a = this.ownRandom(),
        b = this.init;

        let perlinArr = [];

        const canvas2 = document.getElementById('perlin');
        const ctx = canvas2.getContext('2d');

        while(x < len){
            
            if(x % this.wl === 0){
                a = b;
                b = this.ownRandom();
                y = this.h/4 + a * this.amp;
                ctx.fillStyle = 'red';
                console.log(y);
            }else{
                y = this.h / 4 + this.interpolate(a, b, (x % this.wl) / this.wl) * this.amp;
            }
            perlinArr[x] = y;
            if(ctx.fillStyle == '#ff0000'){
                ctx.fillRect(x-1 + (offset ? offset : 0), y-1, 4, 4);
                ctx.fillStyle = 'black';
            }else{
                ctx.fillRect(x + (offset ? offset : 0), y, 2, 2);
            }
            x += 1;
        }
        this.createNewInit(perlinArr[perlinArr.length-1]);
        return perlinArr;
    }
}
