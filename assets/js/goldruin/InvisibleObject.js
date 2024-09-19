//REQUIRES GameObject
//Used to make invsibile walls (used in Exit)
class InvisibleObject extends GameObject{
    
    move(){}
    render(deltaT){
        if(game.debug){
            this.box.render(game.screen, "#F0F");
        }
    }
    remove(){
        this.box.remove();
    }
}