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
    onPreRender(deltaT){
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

    onRender(deltaT){
        
        if (this.currentRoom){
            //Sort List of objects in current room by their y values.
            this.currentRoom.objects.sort((a,b)=>{return a.layer < b.layer ? -1 : a.layer > b.layer ? 1 : a.box.y < b.box.y ? -1 : a.box.y > b.box.y ? 1 : 0;})

            //Render all objects in current room in order.  
            this.currentRoom.objects.forEach((o)=>o.render(deltaT));
        }
        if(this.level){
            //render Info
            this.level.statistics.timeSpent+=deltaT;
            this.renderInfo();
        }
        if (this.player && this.player.controller){
            //Render our controller
            this.player.controller.render();//TODO: find a better way to reference this. 
        }
    }

    renderInfo(){
        if(!this.infoElements){
            this.infoElements = {};
            
            this.infoElements.background = this.infoScreen.drawRect(0, 0, dimensions.width, dimensions.infoHeight, SCREENBLACK, SCREENBLACK, 0);
            this.infoElements.hearts = [];
            this.infoElements.keys = [];
            for(var i=0; i<constants.maxHeartContainers; i++){ 
                var heart = new VC.Sprite(this.infoScreen,images.heartContainer,32,128,32,32, i * 36 + 8, 8)
                this.infoElements.hearts.push(heart);
            }
            for(var i=0; i<5; i++){
                this.infoElements.keys.push(new VC.Sprite(this.infoScreen, images.keyIcons, 32, 192, 32, 32, i * 36 + 8, 48))
            }
            //this.screen.circle(dimensions.width-20,64,10).attr({"fill":"#ffd700", "stroke":"#FFF", "stroke-width": 3});
           
            this.infoElements.coinSprite = new VC.Sprite(this.infoScreen, images.treasure, 36, 504, 36, 36, dimensions.width-36, 48);
            this.infoElements.coinSprite.setFrame(0,Treasure.COIN,0);
    
            this.infoElements.tntSprite = new VC.Sprite(this.infoScreen, images.treasure, 36, 504, 36, 36, dimensions.width-36, 10);
            this.infoElements.tntSprite.scale=.8
            this.infoElements.tntSprite.setFrame(0,Treasure.TNT,0);
    
            var text = this.infoScreen.text(dimensions.width-40,64,"1,000,000")
            text.attr({ "font-size": "32px", "font-family": "monospace", "fill": "#FFF", "text-anchor": "end"});
            this.infoElements.goldElement = text
    
            text = this.infoScreen.text(dimensions.width/2,64,"Level 1-1")
            text.attr({ "font-size": "32px", "font-family": "monospace", "fill": "#FFF", "text-anchor": "middle"});
            this.infoElements.levelElement = text
            
            text = this.infoScreen.text(dimensions.width-40,22,"5")
            text.attr({ "font-size": "32px", "font-family": "monospace", "fill": "#FFF", "text-anchor": "end"});
            this.infoElements.tntElement = text
    
            this.infoScreen.onClear(()=>{this.infoElements=null});
        }
        this.infoElements.hearts.forEach((h, i)=>{
            if(((i + 1) * 10) > this.player.maxHealth){
                h.setAnimation(0,0);
            }else{
                var health = Math.ceil(this.player.health * .2)*5
                if(((i + 1) * 10) <= health){
                    h.setAnimation(0,3);
                } else if (((i + 1) * 10) - 5 <= health){
                    h.setAnimation(0,2);
                }    else {
                    h.setAnimation(0,1);
                }
            }
            h.render(0);
        })
        this.infoElements.keys.forEach((k, i)=>{
            if(this.player.keys.length>i){
                k.setAnimation(0,this.player.keys[i]);
            }else{
                k.setAnimation(0,Treasure.NONE);
            }
            k.render(0);
        });
        this.infoElements.coinSprite.render(0);
        this.infoElements.tntSprite.render(0);
        this.infoElements.goldElement.attr("text",Format.numberWithCommas(this.player.gold));
        this.infoElements.tntElement.attr("text",Format.numberWithCommas(this.player.tntCount));
        this.infoElements.levelElement.attr("text","Level " + this.level.world + "-" + ((this.level.number % 5) + 1));
    }

    onPostRender(deltaT){
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
