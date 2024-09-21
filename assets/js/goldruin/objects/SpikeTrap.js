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
        sfx.floorSpikes(this);
        this.box.width = 62;
        this.box.height = 58;
        this.room.objects.forEach((o)=>{
            if(o.plane==Plane.PHYSICAL && this.box.collidesWith(o.box) && o.hurt!=null){
                var rect = o.box.intersectRect(this.box);
                if(rect){
                    o.hurt(5, Direction.NORTH)
                    var sb = new Starburst(this.room);
                    sb.box = rect
                    this.room.objects.push(sb);
                }
            }
        })
    }
    move(deltaT){
        if(this.state == 0 && Date.now()-this._stateStart > 3000){
            //WARN
            this.state = State.WALKING;
        }else if(this.state ==1 && Date.now()-this._stateStart > 1000){
            //ATTACK!
           this.attack();

        } else if (this.#sprite && this.#sprite.animation.series == State.ATTACKING){
            //RESET TRAP
            if (this.#sprite.animation.frame == 4){
                this.box.width = 0;
                this.box.height = 0;
                    
            } else if (this.#sprite.animation.frame == 7){
                this.box.width = 0;
                this.box.height = 0;
                this.state = State.IDLE;
            }
            
        }
    }

    render (deltaT, screen){
        if(!this.#sprite){
            this.#sprite = new VC.Sprite(screen,images.floorSpikes,496, 150, 62, 50,this.box.x, this.box.y);
            screen.onClear(()=>{
                this.#sprite = null;
            })
        }
        this.#sprite.setAnimation(0,this.state)
        this.#sprite.render()
    }

    remove(){
        if(this.#sprite){
            this.#sprite.remove();
            this.#sprite = null;
        }
        if(this.spikesPlayer){
            this.spikesPlayer.dispose();
        }
    }
}
