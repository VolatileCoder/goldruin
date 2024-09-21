//REQUIRES VC, GameState

VC.Game = class{
    #state = VC.GameState.PAUSED;

    onPreRender(deltaT){}
    onRender(deltaT){}
    onPostRender(deltaT){}
    onPlay(){}
    onPause(){}

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
            this.onPreRender(deltaT);
            this.onRender(deltaT);
            this.onPostRender(deltaT);
        }
        window.setTimeout(()=>{this._loop(startTime);},0);
    }
    
    play(){
        this.#state = VC.GameState.RUNNING;
        this.onPlay();
        if(!this.#looping){
            this._loop(Date.now());
        }
    }

    pause(){
        this.#state = VC.GameState.PAUSED;
        this.onPause();
    }
}