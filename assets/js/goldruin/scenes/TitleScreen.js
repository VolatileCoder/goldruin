//REQUIRES Torch, Direction

class TitleScreen extends VC.Scene {
    #prompt = null;
    #torch1 = null;
    #torch2 = null;
    
    #kcode = "UUDDLRLR";
    #seq = "";
    #r = 1;
    #l = {x:null, y:null};
    #k = 0;
    #exiting = false;
    #rendered = false;
    
    constructor(){
        super();
        
        this.#torch1 = new Torch();
        this.#torch1.box.y = 375;
        this.#torch1.box.x = 100;
        this.#torch1.wall = Direction.NORTH;
        
        this.#torch2 = new Torch();
        this.#torch2.box.y = 375;
        this.#torch2.box.x = 800;
        this.#torch1.wall = Direction.NORTH;
    }

    preDisplay(){
        
    }
    preRender(deltaT){
        this.#torch1.move(deltaT);
        this.#torch2.move(deltaT);
        if (game && game.inputController){
            var c = game.inputController.read();
            if(this.#l.x != c.x || this.#l.y != c.y){
                if(this.#r==1){
                    if(c.y==-1 && c.x==0){
                        this.#seq += "U";
                    }
                    if(c.y==1 && c.x==0){
                        this.#seq += "D"
                    }
                    if(c.y==0 && c.x==-1){
                        this.#seq += "L"
                    }
                    if(c.y==0 && c.x==1){
                        this.#seq += "R"
                    }
                    this.#r = 0;
                }
                if(c.x == 0 && c.y == 0){
                    this.#r=1;
                }
                
                this.#l = c;
            }
            
            if(this.#seq.indexOf(this.#kcode)>-1){//HACK, check suffix only
                this.#k=1;
            }
            if(c.a==1 && !this.#exiting){
                this.#exiting = true;
                //generate level
                music.init();
                this.#prompt.animate({opacity:0},100, "elastic",()=>{
                    if (this.#k==1){
                        sfx.evilLaugh();
                    }else{
                        music.start();
                    }
                    this.#prompt.animate({opacity:1},100, "elastic",()=>{            
                        this.#prompt.animate({opacity:0},100, "elastic",()=>{
                            this.#prompt.animate({opacity:1},100, "elastic",()=>{
                                this.#prompt.animate({opacity:0},100, "elastic",()=>{
                                    this.#prompt.animate({opacity:1},100, "elastic",()=>{
                                    });
                                });
                                this.transitionTo = LevelFactory.Construct(this.#k ? 4 : 0);
                            });
                        });
                    });
                });
            }
        }
    }
    render(deltaT, screen){
        if(this.#rendered == false){
            
            screen.image(images.logo, 150, 150, 600, 320);
            this.#prompt = screen.text(dimensions.width/2, dimensions.width-250, "PRESS " + (VC.Client.orientation == VC.Orientation.PORTRAIT ? "FIRE" : "SPACE BAR") + " TO BEGIN").attr({ "font-size": "48px", "font-family": "monospace", "fill": "#FFF", "text-anchor": "middle", "font-weight": "bold"});  
            screen.text(dimensions.width/2, dimensions.width-133, VERSION).attr({ "font-size": "28px", "font-family": "monospace", "fill": "#888", "text-anchor": "middle", "font-weight": "bold"});  
            this.#rendered = true
        }

        if(this.#torch1){
            this.#torch1.render(deltaT, screen);
        }
        if(this.#torch2){
            this.#torch2.render(deltaT, screen);
        }
        this.#prompt.attr({"text": "PRESS " + (VC.Client.orientation == VC.Orientation.PORTRAIT ? "FIRE" : "SPACE BAR") + " TO BEGIN"});
    }

}