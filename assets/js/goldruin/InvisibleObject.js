//REQUIRES GameObject
//Used to make invsibile walls (used in Exit)
class InvisibleObject extends GameObject{
    render(deltaT){
        if(game.debug){
            this.box.render(game.screen, "#F0F");
        }
    }
    remove(){}
    move(){}
}

function newInvisibleObject(){
    io = newGameObject();
    io.render = function(deltaT){
        if(game.debug){
            this.box.render(game.screen, "#F0F");
        }
    }
    io.remove = function(){}
    io.move = function(){}
    return io;
}