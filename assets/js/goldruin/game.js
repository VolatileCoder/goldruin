//REQUIRES main, Statistics, Direction, State, Team, Adventurer, InputController
class Game extends VC.Game {
    infoScreen = new VC.Screen("info", 0, 0, dimensions.width, dimensions.height);
    screen = new VC.Screen("main", 0, dimensions.infoHeight, dimensions.width, dimensions.height);
    player = new Adventurer(new InputController());
    statistics =  new Statistics(screen)

    constructor(){
        super();
        this.player.team = Team.HEROIC;
    }

    deadObjects = [];
    OnPreRender(deltaT){
        //console.log("test", deltaT);
        if (this.currentRoom){
                this.currentRoom.objects.forEach((o)=>{
                    if(o.state != State.DYING || o.state != State.DEAD){
                        o.move(deltaT);
                    }
                    if(o.state == State.DEAD ){
                        this.deadObjects.push(o);
                    }
                });    
            
            var barred = 0;
            
            this.currentRoom.objects.forEach((o)=>{
                if(o.team == Team.DUNGEON && o.state != State.DYING && o.state != State.DEAD){
                    barred = 1;
                }
            });

            if(this.currentRoom.barred!=barred){
                if(barred){
                    sfx.roomBarred()
                }else{
                    sfx.roomOpened()    
                }
                this.currentRoom.barred = barred;
                this.currentRoom.doors.forEach((d)=>{d.render();});
            }
        }
    }

    OnRender(deltaT){
        
        if (this.currentRoom){
            //Sort List of objects in current room by their y values.
            this.currentRoom.objects.sort((a,b)=>{return a.layer < b.layer ? -1 : a.layer > b.layer ? 1 : a.box.y < b.box.y ? -1 : a.box.y > b.box.y ? 1 : 0;})

            //Render all objects in current room in order.  
            this.currentRoom.objects.forEach((o)=>o.render(deltaT));
        }
        if(this.level){
            //render Info
            this.level.statistics.timeSpent+=deltaT;
            renderInfo();
        }
        if (this.player && this.player.controller){
            //Render our controller
            this.player.controller.render();//TODO: find a better way to reference this. 
        }
    }

    OnPostRender(deltaT){
        //remove the dead objects.
        if(this.currentRoom){
            this.deadObjects.forEach((o)=>{
                if(o!=this.player){
                    this.currentRoom.objects.splice(this.currentRoom.objects.indexOf(o),1)
                }
                o.remove();
            });
            
            this.deadObjects = [];    
        }
    }
}
