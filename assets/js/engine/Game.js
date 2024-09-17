//REQUIRES VC, GameState

VC.Game = class{
    #state = VC.GameState.PAUSED;

    #preRenderEvents = [];
    #preRender(deltaT){
        this.#preRenderEvents.forEach((f)=>{f(deltaT);});
    }
    OnPreRender(f){
        this.#preRenderEvents.push(f);
    }

    #renderEvents = [];
    #render(deltaT){
        this.#renderEvents.forEach((f)=>{f(deltaT);});
    }
    OnRender(f){
        this.#renderEvents.push(f);
    }

    #postRenderEvents = [];
    #postRender(deltaT){
        this.#preRenderEvents.forEach((f)=>{f(deltaT);});
    }
    OnPostRender(f){
        this.#preRenderEvents.push(f);
    }
    
    #playEvents = [];
    #play(){
        this.#playEvents.forEach((f)=>{f();});
    }
    OnPlay(f){
        this.#playEvents.push(f);
    }

    #pauseEvents = [];
    #pause(){
        this.#playEvents.forEach((f)=>{f();});
    }
    OnPause(f){
        this.#playEvents.push(f);
    }

    #looping = false;
    _loop(lastTime){
        if(!this.looping) {
            this.#looping = true;
        }
        var startTime = Date.now();
        var deltaT = Math.round(startTime-lastTime);
        //if(deltaT>1000) deltaT == 1000;
        if(this.#state == VC.GameState.RUNNING){
            this.#preRender(deltaT)
            this.#render(deltaT)
            this.#postRender(deltaT)
        }
        window.setTimeout(()=>{this._loop(startTime);},0);
    }
    
    Play(){
        this.#play();
        this.#state = VC.GameState.RUNNING;
        if(!this.looping){
            this._loop;
        }
    }

    Pause(){
        this.#pause();
        this.#state = VC.GameState.RUNNING;
    }
}