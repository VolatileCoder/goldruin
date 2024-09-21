//REQUIRES GameObject
//Used to make invsibile walls (used in Exit)
class InvisibleObject extends GameObject{
    constructor (room){
        super(room);
    }
    move(){}
    render(deltaT, screen){
        if(DEBUG){
            this.box.render(screen, "#F0F");
        }
    }
    remove(){
        this.box.remove();
    }
}