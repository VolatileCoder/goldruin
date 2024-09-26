//REQUIRES GameObject, Layer, State, Direction, Starburst
class SpikeTrap extends GameObject{
    #sprite = null;
    constructor(room, offsetT){
        super(room);
        this.layer = Layer.SHADOW;
        this.box.width = 0;
        this.box.height = 0;
        this.state = State.IDLE;    
        this._stateStart += offsetT % 3000;
    }
    attack(){
        this.state = State.ATTACKING;
        
        this.playSound(0, SoundEffects.FLOOR_SPIKES, .25, false);

        this.box.width = 62;
        this.box.height = 58;
        this.room.objects.forEach((o)=>{
            if(o.plane==Plane.PHYSICAL && this.box.collidesWith(o.box) && o.hurt!=null){
                var rect = o.box.intersectRect(this.box);
                if(rect){
                    o.hurt(5, Direction.NORTH)
                    var sb = new Starburst(this.room);
                    sb.box = rect
                }
            }
        })
    }
    move(deltaT){
        if(this.state == State.IDLE && Date.now()-this._stateStart > 3000){
            //WARN
            this.state = State.WALKING;
        }else if(this.state == State.WALKING && Date.now()-this._stateStart > 1000){
            //ATTACK!
           this.attack();

        } else if (this.state == State.ATTACKING && Date.now()-this._stateStart>800) {
            this.state = State.IDLE;
            this.box.width = 0;
            this.box.height = 0;    
        }
    }

    render (deltaT, screen){
        if(!this.#sprite){
            this.#sprite = new VC.Sprite(screen,images.floorSpikes,496, 150, 62, 50,this.box.x, this.box.y);
            screen.onClear(()=>{
                this.#sprite = null;
            })
        }

        if(this.state == State.IDLE){
            //WARN
            this.#sprite.setFrame(0, State.IDLE, 0);
        }else if(this.state == State.WALKING){
            //ATTACK!
            this.#sprite.setFrame(0, State.WALKING, 0);
        } else if (this.state == State.ATTACKING) {
            var frame = VC.Math.constrain(0, Math.floor((Date.now()-this._stateStart)/100), 8);
            this.#sprite.setFrame(0, State.ATTACKING, frame);
        }

        this.#sprite.render();
    }

    remove(){
        if(this.#sprite){
            this.#sprite.remove();
            this.#sprite = null;
        }
        super.remove()
    }
}
