//REQUIRES GameObject Layer, Plane, Images

class ScorchMark extends GameObject{
    #sprite = null;
    constructor(room,x,y){
        super(room);
        this.box.x = x-38;
        this.box.y = y-38;
        this.box.width = 0;
        this.box.height = 0;
        this.rotation = Math.round(Math.random() * 360);
        this.style = Math.round(Math.random() * 2);
        this.layer = Layer.SHADOW;
        this.plane = Plane.ETHEREAL;
    }

    move(deltaT){
        return;
    }   

    render(deltaT, screen){   
        if(!this.#sprite){
            this.#sprite = new VC.Sprite(screen, Images.SCORCH_MARK, 75, 225, 75, 75, this.box.x, this.box.y);
            this.#sprite.setAnimation(0,this.style);
            this.#sprite.location.r = this.rotation;
        }
        this.#sprite.render(deltaT); 
    
    }
    remove(){
        if(this.#sprite){
            this.#sprite.remove();
            this.#sprite = null;
        }
    }
}