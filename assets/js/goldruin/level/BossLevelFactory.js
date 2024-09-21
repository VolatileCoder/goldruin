//REQUIRES Level

class BossLevelFactory {
 
    static Construct(levelNumber, screen, infoScreen){
        var hasBoss = (levelNumber % 5 == 4);
        //todo: call BossLevelFactory when Appropriate
        if(!hasBoss){
            throw ("This is not a boss level. Call from LevelFactory instead")
        }
        level = new Level(screen, infoScreen);
        level.number = levelNumber;
        var currentPalette = LevelFactory.getWorldPalette(level.world);
        var nextPalette = LevelFactory.getWorldPalette(level.world + 1);
        
        var startingRoom = level.getRoom(0,0, 7 * constants.brickWidth, 10 * constants.brickWidth);
        startingRoom.palette = currentPalette;

        //startingRoom.box.width = 7 * constants.brickWidth;
        //startingRoom.box.height = 10 * constants.brickWidth;

        var entranceDoor = newDoor(level, startingRoom, Direction.SOUTH, 0);
        entranceDoor.forceBars = true;
        entranceDoor.isEntrance = true;
        entranceDoor.stabilize();
        var bossRoomDoor = newDoor(level, startingRoom, Direction.NORTH, 0);
        bossRoomDoor.stabilize();
        startingRoom.doors = [entranceDoor, bossRoomDoor];

        //add chests
        for(i=0; i<6; i++){
            c = new TreasureChest(i%2 == 0 ? Treasure.HEART : Treasure.TNT);
            
            c.box.x = startingRoom.box.x + constants.tileWidth * (1.5) *  (i % 2 + 1) - (c.box.width/2) + (i % 2 ? 1.5 * constants.tileWidth:0);
            c.box.y = startingRoom.box.y + constants.tileWidth * 2 * (Math.floor(i / 2) + 1)- (c.box.height/2);
            startingRoom.objects.push(c);
        }

        var bossRoom = level.getRoom(0,-1, 13 * constants.brickWidth, 13 * constants.brickWidth, 7);
        bossRoom.isBossRoom = true;

        //TODO:change depending on boss
        bossRoom.palette = {
            clipColor:"#133100",
            wallColor: "#484c4d",
            floorColor: "#4e3301",//"#888c8d", 
            regionColor: "#335115"   
        };
    
        entranceDoor = newDoor(level, bossRoom, Direction.SOUTH, 0);
        entranceDoor.stabilize();
        var rewardDoor = newDoor(level, bossRoom, Direction.NORTH, 0);
        rewardDoor.stabilize();
        bossRoom.doors = [entranceDoor, rewardDoor];
    
        var treasureRoom = level.getRoom(0,-2, 5 * constants.brickWidth, 5 * constants.brickWidth);
        treasureRoom.palette = nextPalette;
        chest = new TreasureChest(treasureRoom, Treasure.HEARTCONTAINER);
        chest.box.x = treasureRoom.box.width/2 + treasureRoom.box.x - chest.box.width/2;
        chest.box.y = treasureRoom.box.height/2 + treasureRoom.box.y - chest.box.height/2;
        treasureRoom.objects.push(chest);
        entranceDoor = newDoor(level, treasureRoom, Direction.SOUTH, 0);
        entranceDoor.stabilize();
        var exitDoor = newDoor(level, treasureRoom, Direction.NORTH, 0);
        exitDoor.stabilize();
        treasureRoom.doors = [entranceDoor, exitDoor];

        var exitRoom = level.getRoom(0,-3, 5 * constants.brickWidth, 10 * constants.brickWidth);
        var exit = new Exit(exitRoom);
        exitRoom.palette = nextPalette;
        exitRoom.objects.push(exit);
        exit.box.x = exitRoom.box.width/2 + exitRoom.box.x - exit.box.width/2;
        exit.box.y = exitRoom.box.height/2 + exitRoom.box.y - exit.box.height/2;
        
        entranceDoor = newDoor(level, exitRoom, Direction.SOUTH, 0);
        entranceDoor.stabilize();
        exitRoom.doors = [entranceDoor];

        //Add torches
        LevelFactory.addTorches(level)
    }
}