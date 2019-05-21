export default class Perlin {
    constructor(seed){
        this.seed = seed || Math.random();
        this.M = 4294967296;
        this.A = 1664525;
        this.C = 1;
        this.Z = Math.floor(this.seed * M);
    }

    ownRandom(){
        this.Z = (this.A * this.Z + this.C) % this.M;
        return this.Z / this.M;
    }
}
