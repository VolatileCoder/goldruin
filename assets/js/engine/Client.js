//REQUIRES Orientation

class Client {
    static get screenHeight(){
        return window.screen.height;
    }
    static get screenWidth(){
        return window.screen.width;
    }
    static _orientation = Orientation.UNSET;
    static get orientation(){
        return Client._orientation;
    }
    static _orientationChangeListeners=[];
    static AddOrientationChangeListener(func){
        Client._orientationChangeListeners.push(func);
    }

    static _lastOrientation = Orientation.UNSET;
    static onOrientationChange(e){
        console.log(Client.screenWidth, Client.screenHeight)
        if((e && e.matches)||Client.screenWidth>=Client.screenHeight) {
            Client._orientation = Orientation.LANDSCAPE;
        } else {
            Client._orientation = Orientation.PORTRAIT;
        }
    
        if (Client.orientation!=Client._lastOrientation || Client._lastOrientation == Orientation.UNSET){
            Client._lastOrientation = Client.orientation;
            Client._orientationChangeListeners.forEach((func)=>{func();})
        }
    }
}

//Bind for changes
window.matchMedia("(orientation: landscape)").addEventListener("change", Client.onOrientationChange)
//Call once to set
Client.onOrientationChange(window.matchMedia("(orientation: landscape)"));
console.log(Client.orientation);
