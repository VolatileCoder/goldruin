//REQUIRES GameObject, Plane, Layer, Torch

class TorchLightEffect extends GameObject{
    #torch = null;
    #element = null;
    #offsetX = 0;
    #offsetY = 0;
    constructor(torch){
        super()
        this.#torch = torch;
        this.box = torch.box;
        this.plane = Plane.ETHEREAL;
        this.layer = Layer.EFFECT;

    }
    move(deltaT){
        this.#offsetX = Math.random() * 7 - 3.5;
        this.#offsetY = Math.random() * 7 - 3.5;
    };
    render(deltaT){
        if(!this.#element){
            this.#element = game.screen.drawEllipse(this.box.center().x, this.box.center().y, this.#torch.intensity * 10 + 140, this.#torch.intensity * 10 + 140, 0, 0, "#fea","#000",0)
            this.#element.attr({"fill":"#fea","opacity": .15});
            game.screen.onClear(()=>{this.#element==null});
        }
        if (this.#torch){
            this.#element.attr({
                "rx": this.#torch.intensity * 10 + 140,
                "ry": this.#torch.intensity * 10 + 140,
                "opacity": this.#torch.intensity * .0125 + .025,
                //"clip-rect": "" + this.box.center().x + "," + this.box.center().y + "," + 140 + "," + 140 
            });
        }

        this.#element.transform("t" + this.#offsetX + "," + this.#offsetY);
        this.#element.toFront();//HACK:shouldn't be needed.    

    };
    remove(){
        if(this.#element){
            this.element.remove();
        }
        this.#element = null;
        this.box.remove();
    }
}
