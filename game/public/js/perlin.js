export default class Perlin {
    constructor(seed){
        this.seed = seed || Math.random();
        this.M = 4294967296;
        this.A = 1664525;
        this.C = 1;
        this.Z = Math.floor(this.seed * this.M);
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

    getPerlin(len, init, offset){
        let h = 400;

        let x = 0,
        y = h / 2,
        amp = 250, //amplitude
        wl = 375, //wavelength
        fq = 1 / wl, //frequency
        a = this.ownRandom(),
        b = init;

        // y = h / 2 + a * amp;
        // a = (y - h / 2) / amp;

        let perlinArr = [];

        const canvas2 = document.getElementById('cevatest');
        const ctx = canvas2.getContext('2d');

        while(x < len){
            
            if(x % wl === 0){
                a = b;
                b = this.ownRandom();
                y = h/5 + a * amp;
                ctx.fillStyle = 'red';
                console.log(y);
            }else{
                y = h / 5 + this.interpolate(a, b, (x % wl) / wl) * amp;
            }
            perlinArr[x] = y;
            console.log(ctx.fillStyle);
            if(ctx.fillStyle == '#ff0000'){
                ctx.fillRect(x-1 + (offset ? offset : 0), y-1, 4, 4);
                ctx.fillStyle = 'black';
            }else{
                // ctx.fillStyle = 'black';
                ctx.fillRect(x + (offset ? offset : 0), y, 1, 1);
            }
            x += 1;
        }
        return perlinArr;
    }
}
