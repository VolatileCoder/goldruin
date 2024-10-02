//REQUIRES VC, Orientation

VC.Client = class {
    static get screenHeight(){
        return window.screen.height;
    }
    static get screenWidth(){
        return window.screen.width;
    }
    static _orientation = VC.Orientation.UNSET;
    static get orientation(){
        return VC.Client._orientation;
    }
    static _orientationChangeListeners=[];
    static OnOrientationChange(func){
        VC.Client._orientationChangeListeners.push(func);
    }
    static _lastOrientation = VC.Orientation.UNSET;
    static _onOrientationChange(e){
        if((e && e.matches)||VC.Client.screenWidth>=VC.Client.screenHeight) {
            VC.Client._orientation = VC.Orientation.LANDSCAPE;
        } else {
            VC.Client._orientation = VC.Orientation.PORTRAIT;
        }
    
        if (VC.Client.orientation!=VC.Client._lastOrientation || VC.Client._lastOrientation == VC.Orientation.UNSET){
            VC.Client._lastOrientation = VC.Client.orientation;
            VC.Client._orientationChangeListeners.forEach((func)=>{func();})
        }
    }

    static _readyListeners=[];
    static _ready = false;
    static OnReady(func){
        if (VC.Client._ready){
            func();
            return;
        }
        VC.Client._readyListeners.push(func);
    }
    static _onReady(func){
        if (VC.Client._ready){
            return
        }
        VC.Client._ready = true;
        VC.Client._readyListeners.forEach((func)=>{func();})
    }
}

//Call once to set
VC.Client._onOrientationChange(window.matchMedia("(orientation: landscape)"));

//Bind for changes
window.matchMedia("(orientation: landscape)").addEventListener("change", VC.Client._onOrientationChange)
document.onreadystatechange = function () {
    if (document.readyState == "complete") {
        // document is ready. Do your stuff here
        VC.Client._onReady();
    }
}
document.addEventListener('DOMContentLoaded', function() {
    VC.Client._onReady();
});
