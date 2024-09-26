//REQUIRES Level, BossLevelFactory, Room, Door
class LevelFactory {
 
    static Construct(levelNumber){
        var hasBoss = (levelNumber % 5 == 4);
        //todo: call BossLevelFactory when Appropriate
        if(hasBoss){
            return BossLevelFactory.Construct(levelNumber);
        }
        

        var level = new Level();
        level.number = levelNumber;
        level.statistics.levelNumber = levelNumber;

        //var defaultOffset = constants.doorWidth + constants.brickWidth + constants.doorFrameThickness * 3;
        
        var roomsPerRegion = 0;
        var maxRegion = 0;
        if(level.number <= 23){
            roomsPerRegion = ((level.number % 5 + 1) * 5) + 5;
            maxRegion = Math.floor(level.number/4);
        } else {
            roomsPerRegion = (((level.number - 24) + 1) * 5) + 25;
            maxRegion = Treasure.BLUEKEY;
        }

        level.palette = LevelFactory.getWorldPalette(level.world);

        //build map
        for(var region = 0; region <= maxRegion; region++){
            var regionRooms = [];
            //get entrance
            var entrance;
            level.doorCount = 0;
            if(level.rooms.length==0){
                entrance = level.getRoom(0,0);
         
            } else {
                extents = level.extents();
                
                //pick a random direction
                var direction = Math.round(4 * Math.random()) % 4;
         

                var extent = extents[direction];
                switch(direction){
                    case Direction.NORTH:
                        entrance = level.getRoom(extent.x, extent.y - 1);
                        break;
                    case Direction.EAST:
                        entrance = level.getRoom(extent.x + 1, extent.y);
                        break;
                    case Direction.SOUTH:
                        entrance = level.getRoom(extent.x, extent.y + 1);
                        break;
                    case Direction.WEST:
                        entrance = level.getRoom(extent.x - 1, extent.y);
                        break;
                }
                //regionRooms.push(entrance);

                // Lock entrance if not starting position.
                entrance.opened = false;
                entrance.lock = region;
                entrance.region = region;
                
                extent.doors.push(new Door(level,extent,direction, 0));
                entrance.doors.push(new Door(level,entrance,(direction + 2) % 4, 0));
                level.statistics.doorsSpawned++;
            }

            entrance.region = region;
            regionRooms.push(entrance); 
            
            while(regionRooms.length < roomsPerRegion){
                var seedRoom = randomEntry(regionRooms);
                if (seedRoom == regionRooms[0] && seedRoom.doors.length == 3)
                {
                    continue;
                }
                var seedDirection = Math.round(4 * Math.random()) % 4;
                if(seedRoom.findDoor(seedDirection)==null){
                    var neighbor = level.findNeighbor(seedRoom,seedDirection);
            
                    
                    if(neighbor == null){
                        switch(seedDirection){
                            case Direction.NORTH:
                                neighbor = level.getRoom(seedRoom.x, seedRoom.y - 1);
                                break;
                            case Direction.EAST:
                                neighbor = level.getRoom(seedRoom.x + 1, seedRoom.y);
                                break;
                            case Direction.SOUTH:
                                neighbor = level.getRoom(seedRoom.x, seedRoom.y + 1);
                                break;
                            case Direction.WEST:
                                neighbor = level.getRoom(seedRoom.x - 1, seedRoom.y);
                                break;
                            default:
                                console.warn({"unexpected seedDirection": seedDirection});
                                
                        }
                        regionRooms.push(neighbor);
                    }else{
                        if(neighbor.region!=region || neighbor == regionRooms[0]){
                            continue
                        }
                    }

                    neighbor.region = region;   
                    seedRoom.doors.push(new Door(level,seedRoom,seedDirection, 0));
                    neighbor.doors.push(new Door(level,neighbor,(seedDirection + 2) % 4, 0));
                }
            }
        }
        
        var exitRoom;
        var maxKey;
        if(level.number <= 19){
            var extents = level.extents();
                
            //pick a random direction
            var direction = Math.round(4 * Math.random()) % 4;
     
            var extent = extents[direction];
            switch(direction){
                case Direction.NORTH:
                    exitRoom = level.getRoom(extent.x, extent.y - 1);
                    break;
                case Direction.EAST:
                    exitRoom = level.getRoom(extent.x + 1, extent.y);
                    break;
                case Direction.SOUTH:
                    exitRoom = level.getRoom(extent.x, extent.y + 1);
                    break;
                case Direction.WEST:
                    exitRoom = level.getRoom(extent.x - 1, extent.y);
                    break;
            }
            //regionRooms.push(entrance);

            //Lock entrance if not starting position.
            exitRoom.opened = false;
            maxKey = maxRegion + 1;
            exitRoom.lock = maxKey;
            exitRoom.region = maxKey;
            extent.doors.push(new Door(level,extent,direction, 0));
            exitRoom.doors.push(new Door(level,exitRoom,(direction + 2) % 4, 0));
            level.statistics.doorsSpawned++;
          
        } else {
            var extents = level.extents();   
            exitRoom = randomEntry(filter(extents,(r)=>{return r.doors.length==1 && r.region == maxRegion}))
            maxKey = maxRegion;
        }
        
        exitRoom.box.height = VC.Math.constrain((constants.roomMinHeightInBricks+2) *constants.brickWidth, exitRoom.box.height, constants.roomMaxHeightInBricks * constants.brickWidth)

        exitRoom.exit = 1;

        //jitter rooms
        for(var i=0;i<level.rooms.length;i++){
            
            var room = level.rooms[i];
            room.jittered = true;
            if(i == 0){
            
                room.doors.forEach((d)=>{d.stabilize()});
               continue;
            }
            room.box.x = Math.round(Math.random() * ((dimensions.width - room.wallHeight * 2 ) - room.box.width)) + room.wallHeight;
            room.box.y = Math.round(Math.random() * ((dimensions.width - room.wallHeight * 2 ) - room.box.height)) + room.wallHeight;
        
            
            var doorPadding = constants.doorFrameThickness + constants.doorWidth/2 + constants.brickWidth/2;

            for(var wall = 0; wall<4; wall++){
                var oppositeWall = (wall + 2) % 4;
                var door = room.findDoor(wall);
                if (!door){
                    continue;
                }
                var neighbor = level.findNeighbor(room, wall);
                if(!neighbor.jittered){
                    continue;
                }
                
                var neighboringDoor = neighbor.findDoor(oppositeWall);
                
                switch(wall){
                    case Direction.NORTH:
                        var doorX = (-neighboringDoor.offset + neighbor.box.width/2 + neighbor.box.x + neighbor.wallHeight);
                        var roomCenter = room.box.x + room.wallHeight + room.box.width/2;
                        var offset = doorX - roomCenter;
    
                        if ((roomCenter + offset) < (room.box.x + room.wallHeight + doorPadding)){
                            var diff = ((room.box.x + room.wallHeight + doorPadding) - (roomCenter + offset));
                            var newleft = room.box.x - diff
                            offset += diff;
                            room.box.x = newleft;
                        }
                        if ((roomCenter + offset) > (room.box.x + room.wallHeight + room.box.width - doorPadding)){
                            var diff = (roomCenter + offset) -(room.box.x + room.wallHeight + room.box.width - doorPadding);
                            room.box.width +=diff;
                            roomCenter = room.box.x + room.wallHeight + room.box.width/2;
                            offset = doorX - roomCenter;
                        }
                        door.offset = offset;
                        break;
                    case Direction.WEST: 
                        var doorY = (neighboringDoor.offset + neighbor.box.height/2 + neighbor.box.y + neighbor.wallHeight);
                        var roomCenter = room.box.y + room.wallHeight + room.box.height/2;
                        var offset = doorY - roomCenter;

                        if ((roomCenter + offset) < (room.box.y + room.wallHeight + doorPadding)){
                            var diff = ((room.box.y + room.wallHeight + doorPadding) - (roomCenter + offset));
                            var newtop = room.box.y - diff
                            offset += diff;
                            room.box.y = newtop;
                        }
                        if ((roomCenter + offset) > (room.box.y + room.wallHeight + room.box.height - doorPadding)){
                            var diff = (roomCenter + offset) -(room.box.y + room.wallHeight + room.box.height - doorPadding);
                            room.box.height +=diff;
                            roomCenter = room.box.y + room.wallHeight + room.box.height/2;                        
                            offset = doorY - roomCenter;
                        }
                        offset = offset *-1
                        
                        door.offset = offset;
                        break;
                    case Direction.SOUTH:
                        var doorX = (neighboringDoor.offset + neighbor.box.width/2 + neighbor.box.x + neighbor.wallHeight);
                        var roomCenter = room.box.x + room.wallHeight + room.box.width/2;
                        var offset = doorX - roomCenter;

                        if ((roomCenter + offset) < (room.box.x + room.wallHeight + doorPadding)){
                            var diff = ((room.box.x + room.wallHeight + doorPadding) - (roomCenter + offset));
                            var newleft = room.box.x - diff
                            offset += diff;
                            room.box.x = newleft;
                        }
                        if ((roomCenter + offset) > (room.box.x + room.wallHeight + room.box.width - doorPadding)){
                            var diff = (roomCenter + offset) -(room.box.x + room.wallHeight + room.box.width - doorPadding);
                            room.box.width +=diff;
                            roomCenter = room.box.x + room.wallHeight + room.box.width/2;
                            offset = doorX - roomCenter;
                        }
                        offset = offset *-1
                        
                        door.offset = offset;
                        break;
                    case Direction.EAST: 
                        var doorY = (-neighboringDoor.offset + neighbor.box.height/2 + neighbor.box.y + neighbor.wallHeight);
                        var roomCenter = room.box.y + room.wallHeight + room.box.height/2;
                        offset = doorY - roomCenter;
                        if ((roomCenter + offset) < (room.box.y + room.wallHeight + doorPadding)){
                            var diff = ((room.box.y + room.wallHeight + doorPadding) - (roomCenter + offset));
                            var newtop = room.box.y - diff
                            offset += diff;
                            room.box.y = newtop;
                        }
                        if ((roomCenter + offset) > (room.box.y + room.wallHeight + room.box.height - doorPadding)){
                            var diff = (roomCenter + offset) -(room.box.y + room.wallHeight + room.box.height - doorPadding);
                            room.box.height +=diff;
                            roomCenter = room.box.y + room.wallHeight + room.box.height/2;
                            offset = doorY - roomCenter;    
                        }
                        
                        door.offset = offset;
                        break;
                }
            }
        }
    

        level.rooms.forEach((r)=>{r.doors.forEach((d)=>d.stabilize())});
        //set exit
        var exit = new Exit(exitRoom);
        exit.box.x = exitRoom.box.x + exitRoom.box.width/2 - exit.box.width/2
        exit.box.y = exitRoom.box.y + exitRoom.box.height/2 - exit.box.height/2
        exitRoom.objects.push(exit);

        //pepper with keys
        for(var key = maxKey; key>Treasure.NONE; key--){
            var keyroom = randomEntry(filter(level.rooms,(r)=>{return r.region < key && r.doors.length == 1 && !r.exit && !r.keyroom}));
            if (keyroom == null){
                keyroom = randomEntry(filter(level.rooms,(r)=>{return r.region < key && !r.exit && !r.keyroom}));    
            }
            var chest = new TreasureChest(keyroom, key);
            keyroom.spawn(chest);
            keyroom.keyroom = true;
            level.statistics.keysSpawned++;
            level.statistics.chestsSpawned++;
        }
        
        //pepper with random treasure chests & enemies
        var minArea = constants.roomMinHeightInBricks * constants.roomMinWidthInBricks * constants.brickWidth * constants.brickWidth;
        var maxArea = constants.roomMaxHeightInBricks * constants.roomMaxHeightInBricks * constants.brickWidth * constants.brickWidth ;
        var thresholds = Math.round((maxArea-minArea) / 4);
        
        level.rooms.forEach((r,n)=>{
            if(n!=0 && !r.exit){
                var roomArea = r.box.width * r.box.height;
                var maxNumberOfObjects = Math.round((roomArea-minArea) / thresholds)
                var minNumberOfObjects = Math.round(Math.round((roomArea-minArea) / thresholds)/2)
                var enemies = VC.Math.constrain(minNumberOfObjects, Math.round(maxNumberOfObjects * Math.random()), maxNumberOfObjects)
                for(var i=0; i<enemies; i++){
                    
                    switch(Math.floor((Math.random()*3)%3)) {
                        case 0: 
                            r.spawn(new SwordSkeleton(r, new AutoController()));
                            level.statistics.swordSkeletonsSpawned++;
                            break;
                        case 1:
                            r.spawn(new CaveSpider(r, new AutoController()));
                            level.statistics.caveSpidersSpawned++;
                            break;
                        case 2:
                            r.spawn(new Snake(r, new AutoController()));
                            level.statistics.snakesSpawned++;
                            break;
                    }
                    
                    
                    level.statistics.enemiesSpawned++;
                }
                var chests = VC.Math.constrain(minNumberOfObjects, Math.round(maxNumberOfObjects * Math.random()), maxNumberOfObjects)
                for(var i=0; i<chests; i++){
                    if (!r.keyroom){
                        r.spawn(new TreasureChest(r, Treasure.RANDOM));
                        level.statistics.chestsSpawned++;
                    }
                }
                if(chests == 0 && r.doors.length == 1 && !r.keyroom){
                    r.spawn(new TreasureChest(r, Treasure.RANDOM));
                    level.statistics.chestsSpawned++;
                }

                //plant floor spikes
                r.doors.forEach((d)=>{
                    var offsetT = 0; // Math.round(Math.random()*3000);
                    if(Math.random()<=.33){
                        switch (d.wall){
                            case Direction.NORTH:
                                var x = r.box.x + r.box.width/2 + d.offset+2;
                                var y = r.box.y;
                                var fs1 = new SpikeTrap(r, offsetT);
                                fs1.box.x = x;
                                fs1.box.y = y;
                                
                                x -= 64
                                var fs2 = new SpikeTrap(r, offsetT);
                                fs2.box.x = x;
                                fs2.box.y = y;offsetT
                                break;
                                
                            case Direction.EAST:
                                var x = r.box.x + r.box.width - 67;
                                var y = r.box.y + r.box.height / 2 + d.offset;
                                var fs1 = new SpikeTrap(r, offsetT);
                                fs1.box.x = x;
                                fs1.box.y = y;
                                y -= 48
                                var fs2 = new SpikeTrap(r, offsetT);
                                fs2.box.x = x;
                                fs2.box.y = y;
                                break;
                            case Direction.SOUTH:
                                var x = r.box.x + r.box.width/2 - d.offset+2;
                                var y = r.box.y + r.box.height - 55;
                                var fs1 = new SpikeTrap(r, offsetT);
                                fs1.box.x = x;
                                fs1.box.y = y;
                                
                                x -= 64
                                var fs2 = new SpikeTrap(r, offsetT);
                                fs2.box.x = x;
                                fs2.box.y = y;
                                break;
                            case Direction.WEST:
                                var x = r.box.x + 5;
                                var y = r.box.y + r.box.height / 2 - d.offset;
                                var fs1 = new SpikeTrap(r, offsetT);
                                fs1.box.x = x;
                                fs1.box.y = y;
                                
                                y -= 48
                                var fs2 = new SpikeTrap(r, offsetT);
                                fs2.box.x = x;
                                fs2.box.y = y;
                                break;   
                        }
                    }
                });


            }
        })
        
        var startingRoom = level.rooms[0];
        var direction = !any(startingRoom.doors,(d)=>{return d.wall==Direction.NORTH}) ? Direction.NORTH :
                        !any(startingRoom.doors,(d)=>{return d.wall==Direction.EAST}) ? Direction.EAST :
                        !any(startingRoom.doors,(d)=>{return d.wall==Direction.WEST}) ? Direction.WEST :
                        Direction.SOUTH;


        var entranceDoor = new Door(level, startingRoom, direction, 0)
        entranceDoor.atmosphere = levelNumber == 0 ? "90-#000:50-#FFe:95" : "#000";
        entranceDoor.forceBars = true;
        entranceDoor.isEntrance = true;
        entranceDoor.stabilize();

        level.rooms[0].doors.push(entranceDoor);


        LevelFactory.addTorches(level);
        
        return level;
    }

    static addTorches(level){
        //Add torches
        level.rooms.forEach((room)=>{
            for(var wall = Direction.NORTH; wall<=Direction.WEST; wall++){
                var wallDoor = room.findDoor(wall);
                if(wallDoor == null){
                    var torch = new Torch(room);
                    switch(wall){
                        case Direction.NORTH:
                            torch.box.x = room.box.center().x;
                            torch.box.y =  room.box.y - room.wallHeight/2;
                            torch.wall = wall;
                            break;
                        case Direction.EAST:
                            torch.box.x = room.box.x + room.box.width + room.wallHeight/2; 
                            torch.box.y = room.box.center().y;
                            torch.wall = wall;
                            break;
                        case Direction.SOUTH:
                            torch.box.x = room.box.center().x;
                            torch.box.y =  room.box.y + room.box.height + room.wallHeight/2;
                            torch.wall = wall;
                            break;
                        case Direction.WEST:
                            torch.box.x = room.box.x - room.wallHeight/2; 
                            torch.box.y =  room.box.center().y;
                            torch.wall = wall;
                            break;
                    }
                    new TorchLightEffect(torch);
                }
            }
        })
    }
    
    static getWorldPalette(worldNumber){
        var worldPalette = [
            //World 1: Desert
            {
                clipColor:"#642",
                wallColor: "#864",
                floorColor: "#753"
            },
            //World 2: Forest
            {    
                clipColor:"#133100",
                floorColor: "#4e3301",
                wallColor: "#4e3301",
            },
            //World 3: Fireplace
            {    
                clipColor:"#200",
                floorColor: "#322",
                wallColor: "#842020",
            },
            //World 4: Ocean
            {    
                clipColor:"#054",
                floorColor: "#265",
                wallColor: "#00796b",
            }
        ]

        var paletteIndex = (worldNumber - 1) % worldPalette.length;
        return worldPalette[paletteIndex];
    }
}