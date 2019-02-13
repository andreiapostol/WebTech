export default class KeyboardState{
    constructor(){
        this.keyStates = new Map();

        this.keyMap = new Map();
    }

    addMapping(keyCode, callback){
        this.keyMap.set(keyCode, callback);
    }
    
    handleEvent(event){
        const {keyCode} = event;
        if(!this.keyMap.has(keyCode)){
            return false;
        }

        event.preventDefault();
        
        const keyState = event.type === 'keydown' ? 1 : 0;

        if(this.keyStates.get(keyCode) === keyState){
            return;
        }

        this.keyStates.set(keyCode, keyState);
        this.keyMap.get(keyCode)(keyState);
    }

    listenTo(window){
        ['keyup', 'keydown'].forEach(eventName => {
            window.addEventListener(eventName, event => {
                this.handleEvent(event);
            });        
        }); 
    }
}