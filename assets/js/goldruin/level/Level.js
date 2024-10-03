//REQUIRES Direction, Music

class Level extends VC.Scene {
    number = -1;
    rooms = [];
    #currentRoom = null;
    #backDropElement = null;
    
    statistics =  null;
    constructor(){
        super();
        this.statistics = new Statistics();
    }
    
    get world(){
        return Math.floor(this.number / 5) + 1;
    }

    get currentRoom(){
        return this.#currentRoom;
    }
    
    set currentRoom(nextRoom){
        if(this.#currentRoom != nextRoom){
            if(this.#currentRoom != null && (this.#currentRoom instanceof Room || this.#currentRoom instanceof PolygonalRoom)){
                this.#currentRoom.doors.forEach((d)=>{
                    var n = this.findNeighbor(this.#currentRoom, d.wall);
                    if(n && (n instanceof Room || n instanceof PolygonalRoom)){
                        n.volume = 0;
                    }
                })
            }
            this.#currentRoom = nextRoom;
            if(this.#currentRoom != null && (this.#currentRoom instanceof Room || this.#currentRoom instanceof PolygonalRoom)){
                this.#currentRoom.doors.forEach((d)=>{
                    var n = this.findNeighbor(this.#currentRoom, d.wall);
                    if(n && (n instanceof Room || n instanceof PolygonalRoom)){
                        n.volume = .25;
                        switch(d.wall){
                            case Direction.EAST: 
                                n.pan = 1;
                                break;
                            case Direction.WEST: 
                                n.pan = -1;
                                break;
                            default:
                                n.pan = 0;
                                break;
                        }
                    }
                })
                this.#currentRoom.volume = 1;
            }
        }
    }
    
    preDisplay(){
        if(this.currentRoom == null && this.rooms.length>0){
            this.currentRoom = this.rooms[0];

            if(this.number % 5 == 4){
                game.playMusic(Music.MYSTERY);
            } else {
                game.playMusic(Music.EXPLORATION);
            }
            
            var startingRoom = this.rooms[0];
            startingRoom.visited = 1;
            this.currentRoom = startingRoom;
            this.currentRoom.volume = 1;

            var entrance = filter(startingRoom.doors, (d)=>{return d.isEntrance})[0];
            
            var direction = Direction.NORTH;
            switch (entrance.wall){
                case Direction.NORTH:
                    game.player.box.x = entrance.box.center().x - game.player.box.width/2;
                    game.player.box.y = entrance.box.y+entrance.box.height - game.player.box.height;
                    direction = Direction.SOUTH;
                    break;
                case Direction.EAST:
                    game.player.box.x = entrance.box.center().x - entrance.box.width/2;
                    game.player.box.y = entrance.box.center().y - game.player.box.height/2;
                    direction = Direction.WEST;
                    break;
                case Direction.SOUTH:
                    game.player.box.x = entrance.box.center().x - game.player.box.width/2;
                    game.player.box.y = entrance.box.y;
                    direction = Direction.NORTH;
                    break;
                case Direction.WEST:
                    game.player.box.x = entrance.box.center().x + entrance.box.width/2;
                    game.player.box.y = entrance.box.center().y - game.player.box.height/2;
                    direction = Direction.EAST;
                    break;
            }
            
            game.player.room = this.currentRoom;
            
            //should be in Exit?
            if(game.player.sprite){
                game.player.sprite.scale = 1;
            }

            game.player.move(0); //?
            game.player.direction = direction;

        }
    }

    preRender(deltaT){
        //console.log("test", deltaT);
        if (this.currentRoom){
            this.currentRoom.preRender(deltaT);
            //player center
            var pc = game.player.box.center();
            this.currentRoom.doors.forEach((d)=>{
                var n = this.findNeighbor(this.currentRoom, d.wall);
                if(n && (n instanceof Room || n instanceof PolygonalRoom)){
                    if(d.isEntrance){
                        n.volume = 0;
                        return
                    }
                    //door center
                    var dc = this.doorCoordinates(this.currentRoom, d);
                    //distance between player and door
                    var d = VC.Trig.distance(pc.x, pc.y, dc.x, dc.y)
                    
                    var maxDistance = 300;
                    d = VC.Math.constrain(0, d, maxDistance);
                    
                    n.volume =  VC.Math.inversePercentToRange(d/maxDistance, .1, .66);

                    n.preRender(deltaT);
                }
            });
        }
    }


    #message = "";
    #lastMessage = "";
    #messageStart = 0;
    #messageDuration = 2000;
    #messageFade = 500;
    #messageBox = null;
    #messageText = null;
    
    set message(text){
        this.#message = text;
        this.#messageStart = Date.now();
    }

    #lastRenderedRoom = null
    render(deltaT, screen){
        if(this.#lastRenderedRoom != this.currentRoom){
            screen.clear();
            this.#lastRenderedRoom = this.currentRoom;
        }
        if(!this.#backDropElement){
            this.#backDropElement = screen.drawRect(0,0,dimensions.width, dimensions.width, SCREENBLACK, SCREENBLACK, 0)
            screen.onClear(()=>{this.#backDropElement = null})
        }
        if (this.currentRoom){
            this.currentRoom.render(deltaT, screen); 
        }
        this.statistics.timeSpent+=deltaT;
        var frameTime = Date.now()
        if(frameTime < this.#messageStart + this.#messageDuration + this.#messageFade){

            if(this.message != this.#lastMessage){
                if(this.#messageText!=null){       
                    this.#messageText.remove();
                    this.#messageText==null;
                }
                if(this.#messageBox!=null){       
                    this.#messageBox.remove();
                    this.#messageBox==null;
                }
            }
            if (this.#messageText==null || this.#messageText!=null){
                //show message
                this.#messageText = (new VC.Paragraph(this.#message, "monospace","28px","bold", "#FFF", dimensions.width-125)).render(screen);
                this.#messageText.attr({"text-anchor": "start"});
                var bbox = this.#messageText.getBBox();
                var x = dimensions.width / 2 - bbox.width / 2;
                var y = (dimensions.width - 33 ) - bbox.height;
                this.#messageText.attr({"x": x, "y": y});
                this.#messageBox = screen.drawRect(x-50, y-50, bbox.width + 100, bbox.height + 100 - 28, SCREENBLACK, "#EEE", 7 );
                this.#messageBox.attr("r", 28)
                screen.onClear(()=>{
                    this.#messageBox = null;
                    this.#messageText = null;
                })
            }
            if (frameTime < this.#messageStart + this.#messageDuration + this.#messageFade){
                var current = frameTime - this.#messageStart - this.#messageDuration;
                var final =  this.#messageFade;
                var opacity = 1-(current / final)
                this.#messageBox.attr("opacity", opacity);
                this.#messageText.attr("opacity", opacity);
            }
            this.#messageBox.toFront();
            this.#messageText.toFront();
        
        }else {
            if(this.#messageText!=null){       
                this.#messageText.remove();
                this.#messageText==null;
            }
            if(this.#messageBox!=null){       
                this.#messageBox.remove();
                this.#messageBox==null;
            }
        }
    }

    postRender(deltaT){
        //remove the dead objects.
        if(this.currentRoom){
            this.currentRoom.postRender(deltaT);
        }
    }

    findRoom(x, y){
        for(i=0;i<this.rooms.length;i++){
            if(this.rooms[i].x==x && this.rooms[i].y==y){
                return this.rooms[i];
            }
        }
        return null;
    }
    postDisplay(){
        this.rooms.forEach((room)=>{
            room.postDisplay();
        });
    }

    doorCoordinates(room, door){
        switch (door.wall){
            case Direction.NORTH:
                return {
                    x: room.box.center().x + door.offset,
                    y: room.box.y
                }
            case Direction.EAST:
                return {
                    x:room.box.x + room.box.width, 
                    y:room.box.center().y + door.offset
                };
            case Direction.SOUTH:
                return {
                    x: room.box.center().x - door.offset,
                    y: room.box.y + room.box.height
                }
            case Direction.WEST:
                return {
                    x:room.box.x , 
                    y:room.box.center().y - door.offset
                };
        }

        return {x:0, y:0};
    }

    findNeighbor(room, direction){
        if(!room) return null;
        switch(direction){
            case Direction.NORTH:
                return this.findRoom(room.x, room.y - 1);
            case Direction.EAST:
                return this.findRoom(room.x + 1, room.y);
            case Direction.SOUTH:
                return this.findRoom(room.x, room.y + 1);
            case Direction.WEST:
                return this.findRoom(room.x - 1, room.y);
            default:
                return null
        }
    }

    getRoom(x, y, w, h, wallHeightInBricks, forceSquare){
        var foundRoom = this.findRoom(x,y);
        if(foundRoom) return foundRoom;
        if (!w && !h) {
            w = Math.round((((constants.roomMaxWidthInBricks - constants.roomMinWidthInBricks) * Math.random()) + constants.roomMinWidthInBricks)) * constants.brickWidth;
            h =  Math.round((((constants.roomMaxHeightInBricks - constants.roomMinHeightInBricks) * Math.random()) + constants.roomMinHeightInBricks)) * constants.brickWidth;
        }
        var room = null;
        if ((w * h) < 160000){
            room = new Room(x, y, w, h, wallHeightInBricks)
        } else {
            if(VC.Math.random(1,7) <= 3 && !forceSquare){
                room = new PolygonalRoom(x, y, w, h, wallHeightInBricks)
            }else {
                //room = new PolygonalRoom(x, y, w, h, wallHeightInBricks)
                room = new Room(x, y, w, h, wallHeightInBricks)
            }
        }
        room.palette = this.palette;
        this.rooms.push(room);
        return room;
    }

    extents(){
        var nMost;
        var eMost;
        var sMost;
        var wMost;
        this.rooms.forEach((r)=>{
            if(nMost==null || nMost.y>r.y || (nMost.y == r.y && r.doors.length<=nMost.doors.length)){
                nMost = r;
            }
            if(eMost==null || eMost.x<r.x || (eMost.x == r.x && r.doors.length<=eMost.doors.length)){
                eMost = r;
            }
            if(sMost==null || sMost.y<r.y || (sMost.y == r.y && r.doors.length<=sMost.doors.length)){
                sMost = r;
            }
            if(wMost==null || wMost.x>r.x || (wMost.x == r.x && r.doors.length<=wMost.doors.length)){
                wMost = r;
            }
        })
        var extents=[];
        extents.push(nMost);
        extents.push(eMost);
        extents.push(sMost);
        extents.push(wMost);
        return extents;
    }

    //TODO: Combine OpenNextRoom and MoveToNextRoom
    openNextRoom(direction){
        var nextRoom = game.level.findNeighbor(this.currentRoom, direction);
        if(nextRoom.opened){
            nextRoom.visited = 1;
            game.player.room = nextRoom;
            this.currentRoom = nextRoom;
             var loc = this.getEntranceLocation(nextRoom,(direction + 2) % 4)
            if (game.player && game.player.box){
                game.player.box.x = loc.x;
                game.player.box.y = loc.y;
                if(game.player.sprite){
                    game.player.sprite.location.x = game.player.sprite.lastLocation.x = (game.player.box.x - 25);
                    game.player.sprite.location.y = game.player.sprite.lastLocation.y = (game.player.box.y - 50);
                }
            }
        }
    }

    moveToNextRoom(gameObject, direction){
        if(gameObject && this.currentRoom && this.currentRoom.findDoor(direction)){
            var nextRoom = game.level.findNeighbor(game.level.currentRoom, direction);  
            gameObject.remove();
            gameObject.room = nextRoom;
            
            var loc = this.getEntranceLocation(nextRoom,(direction + 2) % 4)
            if (gameObject.box){
                gameObject.box.x = loc.x;
                gameObject.box.y = loc.y;
            }
        } 
    }

    
    getEntranceLocation(room, wall){
        wall = wall % 4
        var door = room.findDoor(wall);
        var loc = {x:0, y:0};
        switch (wall){
            case Direction.NORTH:
                return {
                    x : game.player.box.x,//room.box.x + room.wallHeight + door.offset + room.box.width/2,
                    y : room.box.y + 5
                };
            case Direction.EAST: 
                return {
                    x : room.box.x + room.box.width - game.player.box.width - 5, 
                    y : game.player.box.y//room.box.y + room.wallHeight - constants.doorHeight/2
                };
            
            case Direction.SOUTH:
                return {
                    x : game.player.box.x,//room.box.x + room.wallHeight + door.offset + room.box.width/2,
                    y : room.box.y + room.box.height - game.player.box.height - 5
                };
            case Direction.WEST: 
                return {
                    x : room.box.x + game.player.box.width + 5,
                    y : game.player.box.y//room.box.y + room.wallHeight - constants.doorHeight/2
                };
            
            default:
                console.warn("unexpected wall: " + wall)
                return {x:0, y:0};
        }
    }

}