//REQUIRES GameObject, Layer, Plane, State, Images

class Starburst extends GameObject{
    #sprite = null;
    constructor(room){
        super(room)
        this.box.width = 25;
        this.box.height = 25;
        this.layer = Layer.DEFAULT;
        this.plane = Plane.ETHEREAL;
    }
    
    render(deltaT, screen){
        if(this.state == State.DEAD){
            return;
        }
        if(!this.#sprite){
            this.#sprite = new VC.Sprite(screen, Images.STARBURST, 100, 25, 25, 25, this.box.center().x-12, this.box.center().y-12);
            this.#sprite.setAnimation(0,0);
            this.#sprite.location.r = Math.round(Math.random() * 360);
        }
        this.#sprite.render(deltaT); 
    }

    move(deltaT){
        if(Date.now()-this._stateStart>250){
            this.state = State.DEAD;
        }
    }

    remove(){
        if(this.#sprite){
            this.#sprite.remove();
            this.#sprite = null;
        }
    }
}
