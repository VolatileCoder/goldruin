//REQUIRES GameObject, Team, Treasure, Images, SoundEffects

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

    constructor(room, content){
        super(room);
        this.team = Team.UNALIGNED;
        this.box.width=64;
        this.box.height=32;
        this.#opened = false;
        this.#content = content;
    }

    move (deltaT){

        if(game.level && this.room != game.level.currentRoom){
            return;
        }

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
            super.move();
            this.playSound(0,SoundEffects.CHEST, .7, false)
            game.level.statistics.chestsOpened++;
            if(this.#content == Treasure.RANDOM){
                if ((game.player.health/game.player.maxHealth) < Math.random()){
                    this.#content = Treasure.HEART
                } else {
                    this.#content = Math.round(Math.random() * 6) + Treasure.HEART;
                }
                
            }
            if(this.#content >= Treasure.SILVERKEY && this.#content <= Treasure.BLUEKEY){
                game.player.keys.push(this.#content);
                game.level.statistics.keysCollected++;
                setTimeout(()=>{this.playSound(1,SoundEffects.KEY, .7, false);},400);
                
            } else if (this.#content == Treasure.HEART){
                game.player.health = VC.Math.constrain(0, game.player.health + 10, game.player.maxHealth);
                game.level.statistics.heartsCollected++;
                setTimeout(()=>{this.playSound(1,SoundEffects.HEART, .7, false);},400);

            } else if (this.#content == Treasure.TNT){
                game.player.tntCount++;
                game.level.statistics.tntCollected += 1;
                setTimeout(()=>{this.playSound(1,SoundEffects.TNT, .7, false);},400);
            } else if (this.#content == Treasure.HEARTCONTAINER){
                game.player.maxHealth += 10;
                game.player.health = game.player.maxHealth;//TODO: add slowly
                setTimeout(()=>{this.playSound(1,SoundEffects.HEART_CONTAINER, .7, false);},400);
            } else {
                var goldValue = (this.#content - Treasure.TNT ) * 100;
                game.player.gold += goldValue;
                game.level.statistics.goldCollected += goldValue;
                setTimeout(()=>{this.playSound(1,SoundEffects.GOLD, .7, false);},400);
            }
            var prefixes = ["Found", "Got", "Discovered", "Yes! It's", "Grabbed", "Nabbed", "Picked up"]
            var prefix = prefixes[VC.Math.random(0,prefixes.length-1)];
            var suffix = "";
            switch(this.#content){
                case Treasure.SILVERKEY:
                    suffix = "the Silver Key!"
                    break;
                case Treasure.GOLDKEY:
                    suffix = "the Gold Key!"
                    break;
                case Treasure.REDKEY:
                    suffix = "the Red Key!"
                    break;
                case Treasure.GREENKEY:
                    suffix = "the Green Key!"
                    break;
                case Treasure.BLUEKEY:
                    suffix = "the Blue Key!"
                    break;
                case Treasure.HEARTCONTAINER:
                    suffix = "a Heart Container!"
                    break;
                case Treasure.HEART:
                    suffix = "a Heart!"
                    break;
                case Treasure.TNT:
                    suffix = "a Stick of Dynamite!"
                    break;
                case Treasure.COIN:
                    suffix = "an Ancient Coin! (100g)"
                    break;
                case Treasure.CHALICE:
                    suffix = "a Gold Chalice! (200g)"
                    break;
                case Treasure.CROWN:
                    suffix = "a Gold Crown! (300g)"
                    break;
                case Treasure.SWORD:
                    suffix = "an Ornamental Dagger! (400g)"
                    break;
                case Treasure.BEETLE:
                    suffix = "a Gold Scarab! (500g)"
                    break;
            }
            game.level.message = prefix + " " + suffix;
        }
    }

    render(deltaT, screen){
        if(this.#elements.length == 0){
            this.#backgroundSprite = new VC.Sprite(screen,Images.CHEST,64,256,64,64,this.box.x,this.box.y-32);
            this.#elements.push(this.#backgroundSprite);
            //TODO: Move to "pickup" object (animation?)
            this.#contentSprite = new VC.Sprite(screen, Images.TREASURE, 36, 504, 36, 36, this.box.x+14,this.box.y-18)
            this.#elements.push(this.#contentSprite);
            this.#foregroundSprite = new VC.Sprite(screen,Images.CHEST,64,256,64,64,this.box.x,this.box.y-32);
            this.#elements.push(this.#foregroundSprite);
            screen.onClear(()=>{this.#elements=[]});
        }

        if(DEBUG){
            this.box.render(game.screen, "#FF0")
            if (this.#tripFront) this.#tripFront.render(screen, "#0F0");
            if (this.#tripWest) this.#tripWest.render(screen, "#0F0");
            if (this.#tripEast) this.#tripEast.render(screen, "#0F0");
            if (this.#tripBack) this.#tripBack.render(screen, "#0F0");
       
        }
        
        if(this.#opened){

            this.#foregroundSprite.setAnimation(0,1);
            this.#contentSprite.setAnimation(0, this.#content);
            this.#backgroundSprite.setAnimation(0,3);
            
            var offset = (100/1000) * deltaT;
            this.#treasureOffset += offset;
            var opacity = VC.Math.constrain(0,1-(this.#treasureOffset/100), 1);
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
