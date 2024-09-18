//REQUIRES GameObject Layer, Plane

class ScorchMark extends GameObject{
    room = null;
    #sprite = null;
    constructor(x,y){
        super();
        this.box.x = x-38;
        this.box.y = y-38;
        this.box.width = 0;
        this.box.height = 0;
        this.rotation = Math.round(Math.random() * 360);
        this.style = Math.round(Math.random() * 2);
        this.layer = Layer.SHADOW;
        this.plane = Plane.ETHEREAL;
        this.room = null;
    }

    move(deltaT){
        return;
    }   

    render(deltaT){
        if(this.room==null || this.room == game.currentRoom){       
            if(!this.#sprite){
                this.#sprite = new VC.Sprite(game.screen, images.scorch, 75, 225, 75, 75, this.box.x, this.box.y);
                this.#sprite.setAnimation(0,this.style);
                this.#sprite.location.r = this.rotation;
            }
            this.#sprite.render(deltaT); 
        }
    }
    remove(){
        if(this.#sprite){
            this.#sprite.remove();
            this.#sprite = null;
        }
    }
}