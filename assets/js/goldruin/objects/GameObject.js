//REQUIRES Layer, Team, Plane, Direction
class GameObject{
    box = new VC.Box(0,0,50,50);
    direction = Direction.NORTH;
    layer = Layer.DEFAULT;
    plane = Plane.PHYSICAL;
    team = Team.UNALIGNED;
    _stateStart =  Date.now();
    _lastAttack =  new Date(0);
    #audioChannels = [];
    #relativePan = 0;
    #relativeVolume = 1;
    #removed = false;
    constructor(room){
        this.room = room;
    }

    #room = null;
    get room(){
        return this.#room;
    }

    get relativePan(){
        return this.#relativePan;
    }
    set room(nextRoom){
        if (this.#room && (this.#room instanceof Room)){
            var currentIndex = this.#room.objects.indexOf(this);
            if (currentIndex>-1){
                this.#room.objects.splice(currentIndex, 1);
            }
        }
        this.#room = nextRoom;
        if(this.#room && (this.#room instanceof Room)){
            this.#room.objects.push(this);
            this.checkAudioLevels();
        }
    }

    #state = State.IDLE
    get state() {
        return this.#state;
    }
    set state(value){
        if (value!=this.#state){
            this.#state = value;
            this._stateStart = Date.now();
            if(this.state==State.ATTACKING){
                this._lastAttack = Date.now();
            }
        }
    }

    checkAudioLevels(){
        var relativePan = 0;
        var relativeVolume = 1;
        if (game && game.level && game.level.currentRoom == this.room){
            relativePan = -1 + ((this.box.x/dimensions.width) * 2);
            relativeVolume = this.room.volume;
        } else if (this.room){
            relativePan = this.room.pan;
            relativeVolume = this.room.volume;
        } else if (this.room == null){ //TNT, Held by player
            relativePan = -1 + ((game.player.box.center().x/dimensions.width) * 2);
            relativeVolume = 1;
        }
        if (relativePan != this.#relativePan || relativeVolume != this.#relativeVolume){
            this.#relativePan = relativePan;
            this.#relativeVolume = relativeVolume;
            this.#audioChannels.forEach((ac)=>{
                if(ac!=null && ac instanceof VC.AudioChannel){
                    //console.log(relativePan);
                    ac.relativePan = relativePan;
                    ac.relativeVolume = relativeVolume;
                }
            });
        }
    }
    move(deltaT) {
        this.checkAudioLevels();
    }

    render(deltaT, screen){
        this.box.render(screen, "#F0F");
    }

    remove(){
        this.#removed = true;
        this.#audioChannels.forEach((ac)=>{
            console.log("removing audio channel")
            if(ac!=null && ac instanceof VC.AudioChannel){
                ac.dispose();
            }
        });
        this.#audioChannels = [];
        this.box.remove();
    }

    getAudioChannel(channel){
        while(channel>this.#audioChannels.length-1){
            var ac = new VC.AudioChannel();
            ac.relativePan = this.#relativePan;
            ac.relativeVolume = this.#relativeVolume;
            this.#audioChannels.push(ac);
        }
        return this.#audioChannels[channel];
    }

    playSound(channel, uri, volume, loop){
        if(!this.#removed){
            var v = VC.Math.constrain(0, volume, 1);
            this.getAudioChannel(channel).play(uri, volume * game.data.sfxVolume, loop);    
        }
    }
    
    stopSound(channel, uri){
        this.getAudioChannel(channel).stop(uri);
    }
}