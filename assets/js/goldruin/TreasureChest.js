//REQUIRES GameObject, Team, Treasure

class TreasureChest extends GameObject{
    #elements=[]
    #content = Treasure.RANDOM
    #opened = false;
    #tripFront = null;
    #tripWest = null;
    #tripEast = null;
    #tripBack = null;
    #contentSprite = null;
    #backgroundSprite = null;
    #foregroundSprite = null;
    #treasureOffset = 0;

    constructor(content){
        super();
        this.team = Team.UNALIGNED;
        this.box.width=64;
        this.box.height=32;
        this.#opened = 0;
        this.#content = content;
    }

    move (deltaT){

        if(!this.#tripFront){
            this.#tripFront = new VC.Box(this.box.x-game.player.box.width/2, this.box.y+this.box.height, this.box.width + game.player.box.width, game.player.box.height)
        }
        if(!this.#tripWest){
            this.#tripWest = new VC.Box(this.box.x-game.player.box.width, this.box.y-game.player.box.height/2, game.player.box.width, this.box.height + game.player.box.height)
        }
        if(!this.#tripEast){
            this.#tripEast = new VC.Box(this.box.x+this.box.width, this.box.y-game.player.box.height/2, game.player.box.width, this.box.height + game.player.box.height)
        }
        if(!this.#tripBack){
            this.#tripBack = new VC.Box(this.box.x-game.player.box.width/2, this.box.y-game.player.box.height, this.box.width + game.player.box.width, game.player.box.height)
        }
        if(!this.#opened && (
           (game.player.box.inside(this.#tripFront) && game.player.direction==Direction.NORTH) || 
           (game.player.box.inside(this.#tripWest) && game.player.direction==Direction.EAST) ||
           (game.player.box.inside(this.#tripEast) && game.player.direction==Direction.WEST) ||
           (game.player.box.inside(this.#tripBack) && game.player.direction==Direction.SOUTH)
        )){
            this.#opened = true;
            sfx.openChest();
            game.level.statistics.chestsOpened++;
            if(this.#content == Treasure.RANDOM){
                if ((game.player.health/game.player.maxHealth) < Math.random()){
                    this.#content = Treasure.HEART
                } else {
                    this.#content = Math.round(Math.random() * 6) + Treasure.HEART;
                }
                
            console.log("settled content: ", this.#content);
            }
            if(this.#content >= Treasure.SILVERKEY && this.#content <= Treasure.BLUEKEY){
                game.player.keys.push(this.#content);
                game.level.statistics.keysCollected++;
            } else if (this.#content == Treasure.HEART){
                game.player.health=constrain(0, game.player.health + 10, game.player.maxHealth);
                if(game.player.health>=15){
                    sfx.lowHealth(false)
                }
                game.level.statistics.heartsCollected++;
            } else if (this.#content == Treasure.TNT){
                game.player.tntCount++;
                game.level.statistics.tntCollected += 1;
            } else if (this.#content == Treasure.HEARTCONTAINER){
                game.player.maxHealth += 10;
                game.player.health = game.player.maxHealth;//TODO: add slowly
            } else {
                var goldValue = (this.#content - Treasure.TNT ) * 100;
                game.player.gold += goldValue;
                game.level.statistics.goldCollected += goldValue;
            }
            setTimeout(()=>{sfx.treasure(this.#content)},500);
        }
    }

    render(deltaT){
        if(this.#elements.length == 0){
            this.#backgroundSprite = new VC.Sprite(game.screen,images.chest,64,256,64,64,this.box.x,this.box.y-32);
            this.#elements.push(this.#backgroundSprite);
            //TODO: Move to "pickup" object (animation?)
            this.#contentSprite = new VC.Sprite(game.screen, images.treasure, 36, 504, 36, 36, this.box.x+14,this.box.y-18)
            this.#elements.push(this.#contentSprite);
            this.#foregroundSprite = new VC.Sprite(game.screen,images.chest,64,256,64,64,this.box.x,this.box.y-32);
            this.#elements.push(this.#foregroundSprite);
            game.screen.onClear(()=>{this.#elements=[]});
        }

        if(game.debug){
            this.box.render(game.screen, "#FF0")
            if (this.#tripFront) this.#tripFront.render(game.screen, "#0F0");
            if (this.#tripWest) this.#tripWest.render(game.screen, "#0F0");
            if (this.#tripEast) this.#tripEast.render(game.screen, "#0F0");
            if (this.#tripBack) this.#tripBack.render(game.screen, "#0F0");
       
        }
        
        if(this.#opened){

            this.#foregroundSprite.setAnimation(0,1);
            this.#contentSprite.setAnimation(0, this.#content);
            this.#backgroundSprite.setAnimation(0,3);
            
            var offset = (100/1000) * deltaT;
            this.#treasureOffset += offset;
            var opacity = constrain(0,1-(this.#treasureOffset/100), 1);
            this.#contentSprite.opacity = opacity;    
            if(opacity>0){
                this.#contentSprite.location.y -= offset;
            }else{
                this.#content = Treasure.NONE 
            }
        } else {
            this.#foregroundSprite.setAnimation(0,0);
            this.#contentSprite.setAnimation(0, 0);
            this.#backgroundSprite.setAnimation(0,2);
        }
        this.#backgroundSprite.render(deltaT);
        this.#contentSprite.render(deltaT);
        this.#foregroundSprite.render(deltaT);
    }

    remove(){
        if(this.#backgroundSprite){
            this.#backgroundSprite.remove();
            this.#backgroundSprite=null;
        }
        if(this.#foregroundSprite){
            this.#foregroundSprite.remove();
            this.#foregroundSprite=null;
        }
    }
}
