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

    getPerlin(len){
        let h = 100;

        let x = 0,
        y = h / 2,
        amp = 100, //amplitude
        wl = 100, //wavelength
        fq = 1 / wl, //frequency
        a = this.ownRandom(),
        b = this.ownRandom();

        let perlinArr = [];

        const canvas2 = document.getElementById('cevatest');
        const ctx = canvas2.getContext('2d');

        while(x < len){
            if(x % wl === 0){
                a = b;
                b = this.ownRandom();
                y = h / 2 + a * amp;
            }else{
                y = h / 2 + this.interpolate(a, b, (x % wl) / wl) * amp;
            }
            perlinArr[x] = y;
            ctx.fillRect(x, y, 1, 1);
            x += 1;
        }
        return perlinArr;
    }
}
