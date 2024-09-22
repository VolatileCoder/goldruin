//REQUIRES Room, Statistics, Level, LevelFactory

class EndLevelSummary extends Room {
    statistics = null;
    constructor(nextLevel, statistics){
        super(0, 0, 3 * constants.brickWidth, constants.roomMaxHeightInBricks * constants.brickWidth, 5, constants.roomMaxHeightInBricks * constants.brickWidth);
        this.statistics = statistics;
        this.box.x = this.wallHeight;
        this.box.y = Math.round((dimensions.width - this.box.height - this.wallHeight*2) / 2) + this.wallHeight;
        this.palette = JSON.parse(JSON.stringify(game.level.number % 5 == 4 ? LevelFactory.getWorldPalette(game.level.world + 1) : game.level.palette));
        this.palette.clipColor = SCREENBLACK;

        var exit = new Exit(this)
        exit.box.x = this.box.center().x - exit.box.width / 2 ;
        exit.box.y = this.wallHeight + constants.doorFrameThickness * 2;
        var els = this;
        exit.onTrip = function(){
            game.player.keys = [];
            els.transitionTo = LevelFactory.Construct(nextLevel);
        }; 

        var entrance = new Door(null, this, Direction.SOUTH, 0);
        entrance.forceBars = true;
        this.doors.push(entrance);

        game.player.box.x = this.box.center().x - game.player.box.width/2;
        game.player.box.y = this.box.height;
        game.player.sprite.lastLocation.x =  game.player.box.x;
        game.player.sprite.lastLocation.y = game.player.box.y;
        game.player.sprite.scale = 1;
        game.player.speed = 150;
        game.player.direction = Direction.NORTH;
        game.player.room = this;
        
        var wTorch = new Torch(this);
        wTorch.wall = Direction.WEST;
        wTorch.box.x = this.box.x - this.wallHeight / 2;
        wTorch.box.y = dimensions.width * 2 / 3;
        new TorchLightEffect(wTorch);

        var eTorch = new Torch(this);
        eTorch.wall = Direction.EAST;
        eTorch.box.x = this.box.x + this.box.width + this.wallHeight / 2;
        eTorch.box.y = dimensions.width  / 3;
        new TorchLightEffect(eTorch);

    }
    preDisplay(){
        music.exitLevel();
    
    }
    statsRendered = false
    render(deltaT, screen){
        super.render(deltaT, screen)
        if(!this.statsRendered){
            var statsBox = new VC.Box(this.box.x + this.box.width + this.wallHeight, 0, dimensions.width - (this.box.x + this.box.width + this.wallHeight), dimensions.width);
            this.statistics.render(screen, "LEVEL COMPLETE!", statsBox);
            this.statsRendered = true
        }
    }

}
