export default class Timer {
    constructor (deltaTime = 1/60){
        let accummulatedTime = 0;
        let lastTime = 0;

        this.updateProxy = (time)=>{
            accummulatedTime += (time - lastTime) / 1000;
            // console.log(deltaTime);
            while(accummulatedTime > deltaTime){
                this.update(deltaTime);
                accummulatedTime -= deltaTime;
            };
            lastTime = time;
            
            this.enqueue();
        }
    }

    enqueue(){
        requestAnimationFrame(this.updateProxy);
    }

    start(){
        this.enqueue();
    }
}