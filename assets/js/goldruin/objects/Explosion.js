//REQUIRES GameObject, Layer, Plane, State, ScorchMark, Direction

class Explosion extends GameObject{
    
    #sprite = null;
    constructor(room, x, y){
        super(room);
        this.box.x = x - 100;
        this.box.y = y - 100;
        this.box.width = 200;
        this.box.height = 200;
        this.layer = Layer.EFFECT;
        this.plane = Plane.ETHEREAL;
    }

    move(deltaT){
        if(this.state == State.IDLE){
            this.state = State.ATTACKING;
            this.room.objects.forEach((o)=>{
                if(o.plane==Plane.PHYSICAL && this.box.collidesWith(o.box) && o.hurt!=null){
                    var rect = o.box.intersectRect(this.box);
                    if(rect){
                        var diffY = o.box.center().y - this.box.center().y
                        var diffX = o.box.center().x - this.box.center().x
                        
                        //TODO: add in diagnonals, jibs
                        var direction = Direction.NONE;
                        if(Math.abs(diffY)>Math.abs(diffX) && diffY<0){
                            direction = Direction.NORTH;
                        }
                        if(Math.abs(diffY)>Math.abs(diffX) && diffY>0){
                            direction = Direction.SOUTH;
                        }
                        if(Math.abs(diffY)<Math.abs(diffX) && diffX<0){
                            direction = Direction.WEST;
                        }
                        if(Math.abs(diffY)<Math.abs(diffX) && diffX>0){
                            direction = Direction.EAST;
                        }
                        
                        o.hurt(Math.round((rect.height*rect.width)/16), direction);
                        
                    }
                }
            })
            super.move();
            this.playSound(0, SoundEffects.EXPLOSION, 1, false)
        }
        if(this.state != State.DEAD && Date.now()-this._stateStart>400){
            this.state = State.DEAD;
            var scorch = new ScorchMark(this.room, this.box.center().x, this.box.center().y);
        }
    }    

    render(deltaT, screen){ 
        if(this.state == State.DEAD){
            return;
        }
        if(!this.#sprite){
            this.#sprite = new VC.Sprite(screen, images.explosion, 1000, 200, 200, 200, this.box.x, this.box.y);
            this.#sprite.setAnimation(0,0);
            this.#sprite.location.r = Math.round(Math.random() * 360);
            VC.VisualEffects.shake(screen,1, 200);
        }
        this.#sprite.render(deltaT);
    }

    remove = function(){
        if(this.#sprite){
            this.#sprite.remove();
            this.#sprite = null;
        }
    }

}