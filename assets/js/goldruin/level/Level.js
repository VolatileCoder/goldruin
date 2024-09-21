//REQUIRES Direction

class Level extends VC.Scene {
    number = -1;
    rooms = [];
    currentRoom = null;
    #lastRoom = null;
    statistics =  null;
    constructor(){
        super();
        this.statistics = new Statistics();
    }
    
    get world(){
        return Math.floor(this.number / 5) + 1;
    }

    
    preDisplay(){
        if(this.currentRoom == null && this.rooms.length>0){
            this.currentRoom = this.rooms[0];

            if(this.number % 5 == 4){
                sfx.chimes();
                music.mystery();
            } else {
                music.explore();
            }
            
            var startingRoom = this.rooms[0];
            startingRoom.visited = 1;
            this.currentRoom = startingRoom;

            var entrance = filter(startingRoom.doors, (d)=>{return d.isEntrance})[0];
            var direction = Direction.NORTH;
            switch (entrance.wall){
                case Direction.NORTH:
                    game.player.box.x = entrance.box.center().x - game.player.box.width/2;
                    game.player.box.y = entrance.box.y+entrance.box.height - game.player.box.height;
                    direction = Direction.SOUTH;
                    break;
                case Direction.EAST:
                    game.player.box.x = entrance.box.center().x;
                    game.player.box.y = entrance.box.center().y - game.player.box.height/2;
                    direction = Direction.WEST;
                    break;
                case Direction.SOUTH:
                    game.player.box.x = entrance.box.center().x - game.player.box.width/2;
                    game.player.box.y = entrance.box.y;
                    direction = Direction.NORTH;
                    break;
                case Direction.WEST:
                    game.player.box.x = entrance.box.center().x;
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
            this.currentRoom.doors.forEach((d)=>{
                var n = this.findNeighbor(this.currentRoom, d.wall);
                if(n){
                    n.preRender(deltaT);
                }
            })
        }
    }

    render(deltaT, screen){
        if(this.#lastRoom != this.currentRoom){
            screen.clear();
            this.#lastRoom = this.currentRoom;
        }
        if (this.currentRoom){
            this.currentRoom.render(deltaT, screen); 
        }
        this.statistics.timeSpent+=deltaT;
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

    getRoom(x, y, w, h, wallHeightInBricks){
        var foundRoom = this.findRoom(x,y);
        if(foundRoom) return foundRoom;
        var room = new Room(x, y, w, h, wallHeightInBricks)
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
            var loc = getEntranceLocation(nextRoom,(direction + 2) % 4)
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
            
            var loc = getEntranceLocation(nextRoom,(direction + 2) % 4)
            if (gameObject.box){
                gameObject.box.x = loc.x;
                gameObject.box.y = loc.y;
            }
        } 
    }
    

}