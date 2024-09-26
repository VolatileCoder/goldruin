//REQUIRES GameObject, Plane, InvisibleObject

class Exit extends GameObject {
    #elements = [];
    #invisibleObjects = [];
    #hasBeenTripped = false;
    
    constructor(room){
        super(room);
        this.box.width = constants.doorWidth;
        this.box.height = constants.brickWidth * 4;
        this.plane = Plane.ETHEREAL;
    }

    move(deltaT){
        if(this.#invisibleObjects.length==0){
            
            var io = new InvisibleObject();
            io.box.x = this.box.x - constants.doorFrameThickness;
            io.box.y = this.box.y;
            io.box.height = this.box.height;
            io.box.width = constants.doorFrameThickness*2;
            this.room.objects.push(io);
            this.#invisibleObjects.push(io);

            io = new InvisibleObject();
            io.box.x = this.box.x + constants.doorWidth;
            io.box.y = this.box.y;
            io.box.height = this.box.height;
            io.box.width = constants.doorFrameThickness;
            this.room.objects.push(io);
            this.#invisibleObjects.push(io);
            
            io = new InvisibleObject();
            io.box.x = this.box.x;
            io.box.y = this.box.y;
            io.box.width = this.box.width;
            io.box.height = constants.doorFrameThickness;
            this.room.objects.push(io);
            this.#invisibleObjects.push(io);
        }
        if (!this.tripBox){
            this.tripBox = new VC.Box(this.box.x, this.box.y + constants.doorFrameThickness * 3, this.box.width, this.box.height/2);
        }
    }

    render(deltaT, screen){
        if (this.#elements.length==0){
            
            //var exitHeight = constants.brickWidth * 3;

            this.#elements.push(screen.drawRect(this.box.x - constants.doorFrameThickness, this.box.y,  (constants.doorWidth + constants.doorFrameThickness*2),  this.box.height, palette.doorFrame, "#000", constants.lineThickness));
            this.#elements.push(screen.drawRect(this.box.x, this.box.y + constants.doorFrameThickness, this.box.width,  this.box.height - constants.doorFrameThickness, "#000", "#000", constants.lineThickness));
            var steps = 6;
            
            for(var step = steps; step>0; step--){
                var stepWidth = constants.doorWidth - step * 4;
                var stepThickness = constants.brickHeight+2 - step
                this.#elements.push(screen.drawRect(this.box.center().x - stepWidth/2,  (this.box.y + this.box.height)-stepThickness*step,  stepWidth,  stepThickness, "#888", "#000", constants.lineThickness).attr({opacity:(steps-step)/steps}));
            }
            
            screen.onClear(()=>{this.#elements=[]});
        }

        //can only check player position when we're rendering.
        if(game.player.box.inside(this.box)){
            game.player.sprite.scale= VC.Math.constrain(.85,Math.round(((game.player.box.y - this.box.y) * 100 / this.box.height))/100 +.25,1);
            game.player.speed = VC.Math.constrain(100,((game.player.box.y - this.box.y) / this.box.height)*150,150);
        }
        if(game.player.box.inside(this.tripBox) && !this.#hasBeenTripped){
            this.#hasBeenTripped = true;
            this.onTrip();
        }

        if(DEBUG){
            this.box.render(screen, "#0FF")
            //this.tripBox.render(screen, "#F80");
        }
    }

    remove(){
    }

    onTrip(){
        if(game.level){
            game.level.statistics.roomsVisited = filter(game.level.rooms,(r)=>{return r.visited}).length
            game.level.statistics.roomsSpawned = game.level.rooms.length
            game.statistics.add(game.level.statistics);    
            game.level.transitionTo = new EndLevelSummary(game.level.number + 1, game.level.statistics);
        }
    }
}