//REQUIRES GameObject, Layer, Plane, State, ScorchMark

class Explosion extends GameObject{
    
    #sprite = null;
    room = null;
    constructor(x,y){
        super()
        this.box.x = x-100;
        this.box.y = y-100;
        this.box.width = 200;
        this.box.height = 200;
        this.layer = Layer.EFFECT;
        this.plane = Plane.ETHEREAL;
    }

    move(deltaT){
        if(this.room == null){
            this.room = game.currentRoom;
        }
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
            sfx.explosion();
        }
        if(Date.now()-this._stateStart>400){
            this.state = State.DEAD;
            if(this.room == null){
                this.room = game.currentRoom;
            }
            var scorch = new ScorchMark(this.box.center().x, this.box.center().y);
            scorch.room = this.room;
            this.room.objects.push(scorch); 
        }
    }    

    render(deltaT){ 
        if(this.state == State.DEAD){
            return;
        }
        if(this.room==null || this.room == game.currentRoom){       
            if(!this.#sprite){
                this.#sprite = new VC.Sprite(game.screen, images.explosion, 1000, 200, 200, 200, this.box.x, this.box.y);
                this.#sprite.setAnimation(0,0);
                this.#sprite.location.r = Math.round(Math.random() * 360);
            }
            this.#sprite.render(deltaT); 
        }
    }

    remove = function(){
        if(this.#sprite){
            this.#sprite.remove();
            this.#sprite = null;
        }
    }

}