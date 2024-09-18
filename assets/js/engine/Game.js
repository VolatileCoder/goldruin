//REQUIRES VC, GameState

VC.Game = class{
    #state = VC.GameState.PAUSED;

    OnPreRender(deltaT){}
    OnRender(deltaT){}
    OnPostRender(deltaT){}
    OnPlay(){}
    OnPause(){}

    #looping = false;
    _loop(lastTime){
        if(!this.#looping) {
            this.#looping = true;
        }
        var startTime = Date.now();
        var deltaT = Math.round(startTime-lastTime);
        //if(deltaT>1000) deltaT == 1000;
        if(this.#state == VC.GameState.RUNNING){
            //this.#preRender(deltaT)
            this.OnPreRender(deltaT);
            this.OnRender(deltaT)
            this.OnPostRender(deltaT)
        }
        window.setTimeout(()=>{this._loop(startTime);},0);
    }
    
    Play(){
        this.OnPlay();
        this.#state = VC.GameState.RUNNING;
        if(!this.#looping){
            this._loop(Date.now());
        }
    }

    Pause(){
        this.OnPause();
        this.#state = VC.GameState.PAUSED;
    }
}