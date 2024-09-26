//REQUIRES VC
VC.AudioChannel = class{
    #player = null;    
    #volume = 1;
    #relativeVolume = 1;
    #relativePan = 0;
    #uri = "";

    #setVolume(){
        if(this.#player && this.#player instanceof Howl){
            this.#player.volume(this.#volume * this.#relativeVolume);
            this.#player.stereo(this.#relativePan);
            //this.#player.mute(false);
        }
    }

    get volume(){
        return this.#volume;
    }

    set volume(value){
        value = value < 0 ? 0 : (value > 1 ? 1 : value);
        if(this.#volume != value){
            this.#volume = value;
            this.#setVolume();
        }
    }

    get relativeVolume(){
        return this.#relativeVolume;
    }

    set relativeVolume(value){
        value = value < 0 ? 0 : (value > 1 ? 1 : value);
        if(this.#relativeVolume != value){
            this.#relativeVolume = value;
            this.#setVolume();
        }
    }

    get relativePan(){
        return this.#relativePan;
    }

    set relativePan(value){
        value = value < -1 ? -1 : (value > 1 ? 1 : value);
        if(this.#relativePan != value){
            this.#relativePan = value;
            this.#setVolume()
        }
    }
    
    play(uri, volume, loop){
        this.#volume = volume;
        
        if(this.#player && this.#player instanceof Howl && this.#uri == uri && !this.#player.playing()){
            this.#player.play();
            return;
        }

        if(this.#player && this.#player instanceof Howl && this.#uri != uri){
            this.dispose();
        }

        if(this.#player==null){
            this.#player = new Howl({
                src: [uri],
                format: "mp3",
                autoplay: true,
                loop: loop,
                stereo: this.#relativePan,
                volume: this.#volume * this.relativeVolume
            });
        }
        this.#uri = uri;
    }
  
    stop(uri){
        if(uri && this.#uri != uri){
            //already playing something else. 
            return;
        }
        if(this.#player!=null && this.#player.playing()){
            this.#player.stop(); 
        }
    }
  
    fadeOut(callback){
        if(this.#player){
            if( this.volume > 0){
                this.volume-=.1;
                setTimeout(()=>{this.fadeOut(callback)}, 75);
            }else {
                this.#player.stop();
                if(callback){
                    callback();
                }
            }
        } else if (callback){
            callback();
        }
    };
    
    dispose(){
        if(this.#player && this.#player instanceof Howl){
            if (this.#player.playing()) {
                this.#player.stop();
            }
            this.#player.unload();
            this.#player = null;
        }
    }
}