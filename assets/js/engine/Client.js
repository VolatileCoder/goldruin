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
    static OnOrientationChange(func){
        Client._orientationChangeListeners.push(func);
    }
    static _lastOrientation = Orientation.UNSET;
    static _onOrientationChange(e){
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

    static _readyListeners=[];
    static _ready = false;
    static OnReady(func){
        if (Client._ready){
            console.log("WARNING: Client ready already.");
            func();
            return;
        }
        Client._readyListeners.push(func);
    }
    static _onReady(func){
        if (Client._ready){
            return
        }
        Client._ready = true;
        Client._readyListeners.forEach((func)=>{func();})
    }
}

//Call once to set
Client._onOrientationChange(window.matchMedia("(orientation: landscape)"));

//Bind for changes
window.matchMedia("(orientation: landscape)").addEventListener("change", Client._onOrientationChange)
document.onreadystatechange = function () {
    if (document.readyState == "complete") {
        // document is ready. Do your stuff here
        Client._onReady();
    }
}
document.addEventListener('DOMContentLoaded', function() {
    Client._onReady();
});
