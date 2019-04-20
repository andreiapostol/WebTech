export default class Trait {
    constructor(name) {
        this.NAME = name;
    }

    update() {
        console.warn('Out of scope');
    }
}
