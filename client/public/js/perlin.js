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
        
        while(x < len){
            
            if(x % this.wl === 0){
                a = b;
                b = this.ownRandom();
                y = this.h/4 + a * this.amp;
                console.log(y);
            }else{
                y = this.h / 4 + this.interpolate(a, b, (x % this.wl) / this.wl) * this.amp;
            }
            perlinArr[x] = y;
            x += 1;
        }
        this.createNewInit(perlinArr[perlinArr.length-1]);
        return perlinArr;
    }
}
