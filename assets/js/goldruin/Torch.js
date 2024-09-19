//REQUIRES GameObject, Plane, Layer, Direction, State
class Torch extends GameObject{
    intensity = 1;
    wall = Direction.NORTH;
    nextFlicker = new Date(0)
    constructor(){
        super()
        this.box.width=0;
        this.box.height=0;
        this.plane = Plane.ETHEREAL;
        this.layer = Layer.DEFAULT;
    }

    //TODO: Move Particle Effects to their own class; part of Engine, maybe?
    #particles=[];
    move(deltaT){
        if(!this.nextFlicker || this.nextFlicker<Date.now()){
            this.intensity = Math.random();
            this.offsetX = Math.random() * 7 - 3.5;
            this.offsetY = Math.random() * 7 - 3.5;
            this.nextFlicker = Date.now() + Math.random() * 50 + 50;
            if(this.#sprite){
                this.#sprite.setFrame(0, Math.floor(this.intensity * 4) % 4, Math.floor(Math.random()*8) % 8)
            }
            if(this.intensity > .75){
                var particle = game.screen.drawRect(this.box.center().x + Math.random() * 10 - 5, this.box.center().y + Math.random() * 10 - 5,2,2,"#fea","#000",0).attr("opacity",.75);
                particle.kill = Date.now() + 1000 * Math.random() + 250;
                this.#particles.push(particle);
            }
        }
    };
    #sprite = null;
    render(deltaT){
        this.box.render(game.screen, "#FFF");
        if(this.#sprite==null){
            this.#sprite = new VC.Sprite(game.screen, images.torch, 512,256, 64, 64,this.box.x-32, this.box.y-32);
            this.#sprite.lastLocation.r = this.#sprite.location.r = this.wall * 90;
            game.screen.onClear(()=>{
                 this.#sprite = null;
            });
        }

        this.#sprite.render()
        this.#particles.forEach((p)=>{
            switch(this.wall) {
                case Direction.NORTH:
                    p.attr({y: p.attr("y")-deltaT/1000 * 50})
                    break;
                case Direction.EAST:
                    p.attr({x: p.attr("x")+deltaT/1000 * 50})   
                    break; 
                case Direction.SOUTH:
                    p.attr({y: p.attr("y")+deltaT/1000 * 50})
                    break;
                case Direction.WEST:
                    p.attr({x: p.attr("x")-deltaT/1000 * 50})
                    break;
            }
        });

        remove(this.#particles, (p)=>{
            if(p.kill<Date.now()){
                p.remove();
                return true;
            }
            return false;
        })
    };
    remove(){
        if(this.#sprite) {
            this.#sprite.remove();
            this.#sprite = null;
        }
        if(this.#particles){
            this.#particles.forEach((p)=>{p.remove();});
            this.#particles = [];
        }
    }

}