//REQUIRES LevelFactory, State, Statistics

class NewGameScene extends VC.Scene{
    #statistics = null
    #rendered = false;
    
    constructor(levelNumber, maxHealth){
        super();
        game.player.maxHealth = maxHealth;
        game.player.health = game.player.maxHealth;
        game.player.state = State.IDLE;
        game.player.gold = 0;
        game.player.tntCount = 5;
        game.player.keys = [];
        game.statistics = new Statistics();
        this.transitionTo = LevelFactory.Construct(levelNumber);
    }
   
}

