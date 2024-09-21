class GameOverScreen extends VC.Scene{
    #statistics = null
    #rendered = false;
    constructor(statistics){
        super();
        this.#statistics = statistics; 
    }
    preDisplay(){
        music.death();
        game.player.state = State.DEAD;
    }
    preRender(deltaT){}

    render(deltaT, screen){
        if(!this.#rendered){
            screen.drawRect(0, 0, dimensions.width, dimensions.width, SCREENBLACK, SCREENBLACK, 0);
            game.player.sprite.location.x = 250;
            game.player.sprite.location.y = -16;
            game.player.sprite.lastLocation.x = game.player.sprite.location.x;
            game.player.sprite.lastLocation.y = game.player.sprite.location.y;
            game.player.sprite.setFrame(Direction.SOUTH, State.DYING, 7);
            game.player.sprite.render(0);
            game.statistics.render(screen, "YOU DIED!", new VC.Box(50,0,dimensions.width-100,dimensions.width));
            this.#rendered = true;
        }
    }
    postRender(deltaT){
        
        if (game && game.inputController){
            var c = game.inputController.read();
            if(c.a==1){
                //TODO: Move to NewGameScene
                game.player.maxHealth = 30;
                game.player.health = game.player.maxHealth;
                game.player.state = State.IDLE;
                game.player.gold = 0;
                game.player.tntCount = 5;
                game.statistics = new Statistics(game.screen);
                this.transitionTo = LevelFactory.Construct(0);
            }
        }
    }
    postDisplay(){}
}
