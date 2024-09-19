//REQUIRES GameObject, Explosion, Layer, Plane, State

class TNT extends GameObject{
    room = null;
    sprite = null;
    #shadow = null;
    constructor(){
        super();
        this.room = game.currentRoom;
        this.box.width = 24;
        this.box.height = 24;
        this.layer = Layer.DEFAULT;
        this.plane = Plane.ETHEREAL;

        window.setTimeout(()=>{

            if(this.state != State.DEAD){       
                var exp = null;
                if(this.sprite){
                    exp = new Explosion(this.sprite.location.x + this.sprite.size.width/2, this.sprite.location.y + this.sprite.size.height/2)
                } else {
                    exp = new Explosion(this.box.center().x, this.box.center().y);
                }
                game.currentRoom.objects.push(exp);
                if(this.room != game.currentRoom) {
                    exp.room = this.room;
                    this.room.objects.push(exp);
                }
            }
        
            window.setTimeout(()=>{
                if(this.fusePlayer){
                    this.fusePlayer.stop();
                    this.fusePlayer.dispose();
                }
            },200);
            this.state = State.DEAD;
        },2000)
        sfx.fuse(this);
    }

    move(deltaT){
        if(this.state == State.IDLE || this.state == State.DEAD){
             return;
        }
        var releaseSpeed = 400;
        var msPassed = new Date() - this._stateStart;
        var factor = (1-(msPassed/2000));
        var speed = releaseSpeed * factor
        //console.log(factor);

        var proposed = {
            x: this.box.x,
            y: this.box.y
        }

        switch(this.direction){
            case Direction.NORTH:
                proposed.y = this.box.y - speed * deltaT/1000;
                break;
            case Direction.EAST:
                proposed.x = this.box.x + speed * deltaT/1000;
                break;
            case Direction.SOUTH: 
                proposed.y = this.box.y + speed * deltaT/1000;
                break;
            case Direction.WEST:
                proposed.x = this.box.x - speed * deltaT/1000;
                break;
        }

        var constrained = this.room.constrain(this,
            proposed.x,
            proposed.y
        )
     
        if (constrained && (this.box.x != constrained.x || this.box.y != constrained.y)){
            if (this.state!=State.WALKING && this.state!=State.DEAD){
                this.state = State.WALKING;
            }
            this.box.x = constrained.x;
            this.box.y = constrained.y;
        }
        else {
            if (this.room==game.currentRoom && this.state!=State.IDLE){
                this.state = State.IDLE;
            }
        }   

    }    

    render(deltaT){
        if(this.state == State.DEAD || this.room != game.currentRoom){
            return;
        }
        if(game.debug){
            this.box.render(game.screen, "#F00")
        }
        if(!this.sprite){
            this.sprite = new VC.Sprite(game.screen, images.dynamite, 384, 24, 24, 24, this.box.center().x-12, this.box.center().y-12);
            this.sprite.setAnimation(0,0);
        }
           
        var x = this.box.center().x - 4;
        var y = this.box.center().y + 5;
        if(!this.#shadow){
            this.#shadow = game.screen.drawEllipse(x, y, 8, 2, 0, 0, "#111","#111",".5")
            this.#shadow.transform("r0,0,45");// + x +"," + y +  ",1") 
            this.#shadow.attr({"opacity": .5, "r":45});
        }
        this.#shadow.animate({"cx":x, "cy":y}, deltaT, 'linear');
        
        //todo: set frame of dynamite
        //todo: drop immediately when obstructed

        var msPassed = new Date() - this._stateStart;
        var perc = 1-(msPassed/2000);
        var factor = Math.PI - ((Math.PI-1)*(perc));
        var offset = constrain(0, 50 * Math.sin(factor*1.5), 50)

        if(DEBUG){
            this.box.render(game.screen, "#800");
        }

        this.sprite.location.x = this.box.x;
        this.sprite.location.y = this.box.y - offset;
        this.sprite.render(deltaT); 
    }

    remove(){
        this.box.remove();
        if(this.sprite){
            this.sprite.remove();
            this.sprite = null;
        }
        if(this.#shadow){
            this.#shadow.remove();
            this.#shadow = null;
        }
    }
   
}