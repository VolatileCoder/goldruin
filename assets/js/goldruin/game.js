//REQUIRES main, Statistics, Direction, State, Team, Adventurer, InputController
//REQUIRES TitleScreen
class Game extends VC.Game {
    infoScreen = new VC.Screen("info", 0, 0, dimensions.width, dimensions.height);
    screen = new VC.Screen("main", 0, dimensions.infoHeight, dimensions.width, dimensions.height);
    inputController = new InputController();
    player = null;
    statistics =  new Statistics(screen);
    currentScene = null;

    constructor(){
        super();
        
        this.player = new Adventurer(null, this.inputController);
        this.player.team = Team.HEROIC;
        this.player.tntCount = 5;
        
        this.currentScene = new TitleScreen(this.screen, this.infoScreen);
        this.currentScene.preDisplay();
    }
    
    get level(){
        if (this.currentScene instanceof Level){
            return this.currentScene;
        }
        return null;
    }

    onPreRender(deltaT){
        if(this.currentScene){
            this.currentScene.preRender(deltaT)
        }
    }

    onRender(deltaT){
        if(this.currentScene){
            this.currentScene.render(deltaT, this.screen)
        }
        if(this.level){
            this.renderInfo();
        }
        if (this.inputController){
            //Render our controller
            this.inputController.render(this.screen);//TODO: find a better way to reference this. 
        }
    }

    onPostRender(deltaT){
        if(this.currentScene){
            this.currentScene.postRender();
        
            if(this.currentScene.transitionTo && this.currentScene.transitionTo instanceof VC.Scene){
                var transitionTo = this.currentScene.transitionTo;
                while (transitionTo.transitionTo){
                    transitionTo = transitionTo.transitionTo;
                }
                this.currentScene.postDisplay();
                
                var fadeColor = SCREENBLACK; 
                if ((this.currentScene instanceof TitleScreen) || (this.currentScene instanceof GameOverScreen)){
                    fadeColor = "#FFF"
                }
                this.pause();
                this.screen.fadeTo(fadeColor, ()=>{
                    this.currentScene = transitionTo;
                    this.currentScene.preDisplay();
                    //render one frame
                    this.onPreRender(0);
                    this.onRender(0);
                    this.onPostRender(0);

                    this.screen.fadeInFrom(fadeColor,()=>{;
                        this.play();
                    })
                });
            }
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
        if(this.level){
            this.infoElements.levelElement.attr("text","Level " + this.level.world + "-" + ((this.level.number % 5) + 1));
        }
    }
}
