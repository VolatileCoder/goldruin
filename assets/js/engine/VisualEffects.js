//REQUIRES VC

VC.VisualEffects = class {
    //Todo: refactor
    static shake(screen, intensity, ms){
        var rate = 50;
        var div =  document.getElementById(screen.domElementId);
        div.style.top = Math.round(Math.random() * intensity * (Math.random()>.5 ? 1 : -1)) +'px';
        div.style.left = Math.round(Math.random() * intensity * (Math.random()>.5 ? 1 : -1)) + 'px';

        if(ms>0){
            setTimeout(()=>{VC.VisualEffects.shake(screen, intensity, ms-50);},50)
            }else{
            div.style.top = 0;
            div.style.left = 0;
        }
    }
}