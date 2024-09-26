class Room extends VC.Scene {
    objects=[]
    #deadObjects = [];
    x = 0;
    y = 0;
    box = null;
    wallHeight = 0;
    region = 0;
    opened = 1;
    barred = 0;
    mapped = 0; //HACK: Still in use?
    isBossRoom = 0;//HACK: Relevance?
    doors = [];
    palette = {
        clipColor:"#642",
        wallColor: "#864",
        floorColor: "#753" 
    };
    tileSeed = 0;
    structureRendered = false;
    #doorsRendered = false;
    #audioChannel = new VC.AudioChannel();

    constructor(x, y, w, h, wallHeightInBricks){
        super();
        this.x = x; //map address
        this.y = y; //map address
        this.box = new VC.Box(0,0,w?w:0,h?h:0);
        this.wallHeight = constants.brickHeight * (wallHeightInBricks ? wallHeightInBricks : 5);
        this.tileSeed = Math.floor(Math.random()*100);

        if(this.box.width == 0){
            this.box.width = Math.round((((constants.roomMaxWidthInBricks - constants.roomMinWidthInBricks) * Math.random()) + constants.roomMinWidthInBricks)) * constants.brickWidth;
        }
        
        if(this.box.height == 0){
            this.box.height = Math.round((((constants.roomMaxHeightInBricks - constants.roomMinHeightInBricks) * Math.random()) + constants.roomMinHeightInBricks)) * constants.brickWidth;
        }
        //center by default
        this.box.x = Math.round((dimensions.width - this.box.width - this.wallHeight*2) / 2) + this.wallHeight;
        this.box.y = Math.round((dimensions.width - this.box.height - this.wallHeight*2) / 2) + this.wallHeight;

    }

    #volume = 0;
    get volume(){
        return this.#volume;
    }

    set volume(value){
        value = value < 0 ? 0 : (value > 1 ? 1 : value);
        if(this.#volume != value){
            this.#volume = value;
            this.#checkAudioLevels();
        }
    }
    #pan = 0;
    get pan(){
        return this.#pan;
    }

    set pan(value){
        value = value < -1 ? -1 : (value > 1 ? 1 : value);
        if(this.#pan != value){
            this.#pan = value;
            this.#checkAudioLevels()
        }
    }
    
    #checkAudioLevels(){
        this.objects.forEach((o)=>o.checkAudioLevels());
    }


    preRender(deltaT){
        this.objects.forEach((o)=>{
            if(o.state != State.DYING || o.state != State.DEAD){
                o.move(deltaT);
            }
            if(o.state == State.DEAD ){
                this.#deadObjects.push(o);
            }
        });
        
        var barred = 0;
        this.objects.forEach((o)=>{
            if(o.team == Team.DUNGEON && o.state != State.DYING && o.state != State.DEAD){
                barred = 1;
            }
        });

        if(this.barred!=barred && game && game.level && this == game.level.currentRoom ){
            if(barred){
                this.#audioChannel.play(SoundEffects.ROOM_BARRED, game.data.sfxVolume, false);
            }else{
                this.#audioChannel.play(SoundEffects.ROOM_OPENED, game.data.sfxVolume, false);
            }
            this.barred = barred;
            this.#doorsRendered = false
        }
    

    }

    render(deltaT, screen){

        if(!this.structureRendered){
            this.renderStructure(screen);
            this.structureRendered = true;
            screen.onClear(()=>{this.structureRendered = false;})
        }
        if(!this.#doorsRendered){
            this.doors.forEach((d)=>{d.render(screen);});
            this.#doorsRendered = true;
        }
        //Sort List of objects in current room by their y values.
        this.objects.sort((a,b)=>{return a.layer < b.layer ? -1 : a.layer > b.layer ? 1 : a.box.y < b.box.y ? -1 : a.box.y > b.box.y ? 1 : 0;})

        //Render all objects in current room in order.  
        this.objects.forEach((o)=>o.render(deltaT, screen));
    }

    postRender(deltaT){
        this.#deadObjects.forEach((o)=>{
            if(o!=game.player){
                o.remove();
                o.room = null;
            }
        });
        
        this.#deadObjects = [];   
    }

    postDisplay(){
        var removable = [];
        this.objects.forEach((o)=>{
            if(o!=game.player){
                o.remove();
                removable.push(o);
                //o.room = null;
            }
        });
        removable.forEach((o)=>{ o.room = null;})
        removable = [];
        this.#audioChannel.dispose();
    }


    renderStructure(screen){
        //render room
        //render clip area
        screen.drawRect(0, 0, dimensions.width, dimensions.width, this.palette.clipColor, this.palette.clipColor, 0);
            
        //render walls
        screen.drawRect(
            this.box.x - this.wallHeight,
            this.box.y - this.wallHeight, 
            this.box.width + this.wallHeight * 2,
            this.box.height + this. wallHeight * 2,
            this.palette.wallColor,
            this.palette.wallColor,
            0
        );
        
        if(this.region!=0 || this.palette.regionColor){
            screen.drawRect(
                this.box.x - this.wallHeight + constants.brickHeight * 2,
                this.box.y - this.wallHeight + constants.brickHeight * 2, 
                this.box.width + this.wallHeight * 2 - constants.brickHeight * 4,
                this.box.height + this. wallHeight * 2  - constants.brickHeight * 4,
                this.palette.regionColor ? this.palette.regionColor : regionColor(this.region),
                "#000",
                0
            );
           
            screen.drawRect(
                this.box.x - this.wallHeight + constants.brickHeight * 3,
                this.box.y - this.wallHeight + constants.brickHeight * 3, 
                this.box.width + this.wallHeight * 2 - constants.brickHeight * 6,
                this.box.height + this. wallHeight * 2  - constants.brickHeight * 6,
                this.palette.wallColor,
                "#000",
                0
            );
                    
        }

        //render each wall
        this.renderBricks(screen)

        //render doors
        this.doors.forEach((door)=>door.render(screen));

        //render floor
        screen.rect(
            this.box.x,
            this.box.y, 
            this.box.width, 
            this.box.height
        ).attr({
            fill: this.palette.floorColor,
            "stroke-width": constants.lineThickness
        })

        var t = this.tileSeed;
        var tileWidth = constants.tileWidth;
        for(var r=0; r<this.box.height;r+=tileWidth){
            for(var c=0; c<this.box.width;c+=tileWidth){
                var x = c + this.box.x;
                var y = r + this.box.y;
                var w = tileWidth;
                var h = tileWidth;
                if(c+w>this.box.width){
                    w = this.box.width - c;
                }
                if(r+h>this.box.height){
                    h = this.box.height - r;
                }
                screen.drawRect(x, y, w, h, VC.Color.calculateAlpha(this.palette.floorColor,tiles[t],.25),VC.Color.calculateAlpha(this.palette.floorColor,"#000",.25),1.5)//.attr({opacity:.25});
                t = (t+1) % tiles.length;
            }   
        }

               
        if(this.isBossRoom){
            
            var w = tileWidth;
            var h = tileWidth;
            
            var startX = this.box.x + w * 3;
            var startY = this.box.y + (h * 3);
            

            screen.drawRect(startX + w * 0, startY + h * 0, w, h,  VC.Color.calculateAlpha(this.palette.floorColor,"#fff",.10), VC.Color.calculateAlpha(this.palette.floorColor,"#000",.25), 1.5);
            screen.drawRect(startX + w * 1, startY + h * 0, w, h,  VC.Color.calculateAlpha(this.palette.floorColor,"#efefef",.10), VC.Color.calculateAlpha(this.palette.floorColor,"#000",.25), 1.5);
            screen.drawRect(startX + w * 2, startY + h * 0, w, h,  VC.Color.calculateAlpha(this.palette.floorColor,"#ffefff",.10), VC.Color.calculateAlpha(this.palette.floorColor,"#000",.25), 1.5);
            screen.drawRect(startX + w * 3, startY + h * 0, w, h,  VC.Color.calculateAlpha(this.palette.floorColor,"#ddd",.10), VC.Color.calculateAlpha(this.palette.floorColor,"#000",.25), 1.5);
            screen.drawRect(startX + w * 4, startY + h * 0, w, h,  VC.Color.calculateAlpha(this.palette.floorColor,"#efe",.10), VC.Color.calculateAlpha(this.palette.floorColor,"#000",.25), 1.5);
       
            screen.drawRect(startX + w * 0, startY + h * 1, w, h,  VC.Color.calculateAlpha(this.palette.floorColor,"#eff",.10), VC.Color.calculateAlpha(this.palette.floorColor,"#000",.25), 1.5);
            screen.drawRect(startX + w * 1, startY + h * 1, w, h,  VC.Color.calculateAlpha(this.palette.floorColor,"#fee",.10), VC.Color.calculateAlpha(this.palette.floorColor,"#000",.25), 1.5);
            screen.drawRect(startX + w * 2, startY + h * 1, w, h,  VC.Color.calculateAlpha(this.palette.floorColor,"#ffe",.10), VC.Color.calculateAlpha(this.palette.floorColor,"#000",.25), 1.5);
            screen.drawRect(startX + w * 3, startY + h * 1, w, h,  VC.Color.calculateAlpha(this.palette.floorColor,"#fef",.10), VC.Color.calculateAlpha(this.palette.floorColor,"#000",.25), 1.5);
            screen.drawRect(startX + w * 4, startY + h * 1, w, h,  VC.Color.calculateAlpha(this.palette.floorColor,"#fef",.10), VC.Color.calculateAlpha(this.palette.floorColor,"#000",.25), 1.5);
            
            screen.drawRect(startX + w * 0, startY + h * 2, w, h,  VC.Color.calculateAlpha(this.palette.floorColor,"#eef",.10), VC.Color.calculateAlpha(this.palette.floorColor,"#000",.25), 1.5);
            //screen.drawRect(startX + w * 1, startY + h * 2, w, h,  VC.Color.calculateAlpha(this.palette.floorColor,"#fff",.25), VC.Color.calculateAlpha(this.palette.floorColor,"#000",.25), 1.5);
            screen.drawRect(startX + w * 2, startY + h * 2, w, h,  VC.Color.calculateAlpha(this.palette.floorColor,"#fff",.10), VC.Color.calculateAlpha(this.palette.floorColor,"#000",.25), 1.5);
            //screen.drawRect(startX + w * 3, startY + h * 2, w, h,  VC.Color.calculateAlpha(this.palette.floorColor,"#fff",.25), VC.Color.calculateAlpha(this.palette.floorColor,"#000",.25), 1.5);
            screen.drawRect(startX + w * 4, startY + h * 2, w, h,  VC.Color.calculateAlpha(this.palette.floorColor,"#fee",.10), VC.Color.calculateAlpha(this.palette.floorColor,"#000",.25), 1.5);
       

            //screen.drawRect(startX + w * 0, startY + h * 3, w, h,  VC.Color.calculateAlpha(this.palette.floorColor,"#fff",.25), VC.Color.calculateAlpha(this.palette.floorColor,"#000",.25), 1.5);
            screen.drawRect(startX + w * 1, startY + h * 3, w, h,  VC.Color.calculateAlpha(this.palette.floorColor,"#def",.10), VC.Color.calculateAlpha(this.palette.floorColor,"#000",.25), 1.5);
            screen.drawRect(startX + w * 2, startY + h * 3, w, h,  VC.Color.calculateAlpha(this.palette.floorColor,"#fed",.10), VC.Color.calculateAlpha(this.palette.floorColor,"#000",.25), 1.5);
            screen.drawRect(startX + w * 3, startY + h * 3, w, h,  VC.Color.calculateAlpha(this.palette.floorColor,"#edf",.10 ), VC.Color.calculateAlpha(this.palette.floorColor,"#000",.25), 1.5);
            //screen.drawRect(startX + w * 4, startY + h * 3, w, h,  VC.Color.calculateAlpha(this.palette.floorColor,"#fff",.25), VC.Color.calculateAlpha(this.palette.floorColor,"#000",.25), 1.5);
        
        }

    }

    renderBricks(screen){
        var color="#000";
        var rows = this.box.height/constants.brickHeight;
        
        //Direction.NORTHERN WALL
        //determine focal point / offset
        var focus={};
        focus.x =  this.box.width / 2
        focus.y = VC.Trig.cotangent(VC.Trig.degreesToRadians(45)) * focus.x;
        
        var offset={};
        offset.x = focus.x + this.box.x;
        offset.y = focus.y + this.box.y;
        
        screen.drawAngleSegmentX(VC.Trig.degreesToRadians(225), -this.box.width/2-this.wallHeight, -this.box.width/2, offset.x, offset.y, color, constants.lineThickness);
    
        var row = 1;
        for(var y = 0; y<this.wallHeight; y+=constants.brickHeight){
            var y1 = -(this.box.width)/2 - this.wallHeight + y;
            var y2 = y1 + constants.brickHeight
            var column = 0;
        
            for(var x = constants.brickWidth/2; x < this.box.width ; x += constants.brickWidth/2){
                var angle = VC.Trig.pointToAngle(this.box.width / 2, this.box.width / 2 - x);
                
                if(column % 2 == row % 2){
                    screen.drawAngleSegmentY(angle, y1, y2, offset.x, offset.y, color, constants.lineThickness);
                    //break;
                }
                //break;
                column ++;
            }
            if(row>1){
                screen.drawLine(Math.round(VC.Trig.cotangent(VC.Trig.degreesToRadians(225)) * y1)+offset.x, y1 + offset.y, Math.round(VC.Trig.cotangent(VC.Trig.degreesToRadians(315)) * y1)+offset.x, y1+offset.y, color, constants.lineThickness);
            }
            row++;
        }
        
        //Direction.SOUTHERN WALL
        //determine focal point / offset
        focus={};
        focus.x =  this.box.width / 2
        focus.y = -VC.Trig.cotangent(VC.Trig.degreesToRadians(225)) * focus.x;
        
        offset={};
        offset.x = focus.x + this.box.x;
        offset.y = focus.y + this.box.y + this.box.height;
    
        screen.drawAngleSegmentX(VC.Trig.degreesToRadians(225), this.box.width/2+this.wallHeight, this.box.width/2, offset.x, offset.y, color, constants.lineThickness);
    
        row = 1;
        for(y = 0; y<this.wallHeight; y+=constants.brickHeight){
            var y1 = (this.box.width)/2 + this.wallHeight - y;
            var y2 = y1 - constants.brickHeight
            var column = 0;
        
            for(x = constants.brickWidth/2; x < this.box.width ; x += constants.brickWidth/2){
                var angle = VC.Trig.pointToAngle(this.box.width / 2, this.box.width / 2 - x);
                
                if(column % 2 == row % 2){
                    screen.drawAngleSegmentY(angle, y1, y2, offset.x, offset.y, color, constants.lineThickness);
                    //break;
                }
                //break;
                column ++;
            }
            if(row>1){
                screen.drawLine(Math.round(VC.Trig.cotangent(VC.Trig.degreesToRadians(225)) * y1)+offset.x, y1 + offset.y, Math.round(VC.Trig.cotangent(VC.Trig.degreesToRadians(315)) * y1)+offset.x, y1+offset.y, color, constants.lineThickness);
            }
            row++;
        }
    
    
        //Direction.EASTERN WALL
        //determine focal point / offset
        focus={};
        focus.y = -this.box.height / 2
        focus.x = VC.Trig.tangent(VC.Trig.degreesToRadians(135)) * focus.y;
        
        offset={};
        offset.x = focus.x + this.box.x;
        offset.y = focus.y + this.box.y + this.box.height;
    
        screen.drawAngleSegmentY(VC.Trig.degreesToRadians(135), this.box.height/2+this.wallHeight, this.box.height/2, offset.x, offset.y, color, constants.lineThickness);
    
        row = 0;
        for(x = 0; x<this.wallHeight; x+=constants.brickHeight){
            var x1 = -this.box.height/2 - this.wallHeight + x;
            var x2 = x1 + constants.brickHeight;
            var column = 0;
            //screen.drawLine(x1+ offset.x, 0, x2+offset.x, dimensions.height, "#FF0", constants.lineThickness);
        
            for(y = constants.brickWidth/2; y < this.box.height ; y += constants.brickWidth/2){
                var angle = VC.Trig.pointToAngle(-this.box.height / 2+y, -this.box.height / 2);
                
                    if(column % 2 == row % 2){
                        screen.drawAngleSegmentX(angle, x1, x2, offset.x, offset.y, color, constants.lineThickness);
                        //break;
                    }
                //break;
                column ++;
            }
            if(row>0){
            //    screen.drawLine(Math.round(VC.Trig.cotangent(VC.Trig.degreesToRadians(135)) * y1)+offset.x, y1 + offset.y, Math.round(VC.Trig.cotangent(VC.Trig.degreesToRadians(225)) * y1)+offset.x, y1+offset.y, color, constants.lineThickness);
                screen.drawLine(x1 + offset.x, Math.round(VC.Trig.tangent(VC.Trig.degreesToRadians(135))*x1)+offset.y, x1 + offset.x, Math.round(VC.Trig.tangent(VC.Trig.degreesToRadians(225))*x1)+offset.y, color, constants.lineThickness);
            
            }
            row++;
        }
    
        //Direction.WESTERN WALL
        //determine focal point / offset
        focus={};
        focus.y = -this.box.height / 2
        focus.x = VC.Trig.tangent(VC.Trig.degreesToRadians(225)) * focus.y;
        
        offset={};
        offset.x = focus.x + this.box.x + this.box.width;
        offset.y = focus.y + this.box.y + this.box.height;
    
        screen.drawAngleSegmentY(VC.Trig.degreesToRadians(315), -this.box.height/2-this.wallHeight, -this.box.height/2, offset.x, offset.y, color, constants.lineThickness);
        
        row = 0;
        for(x = 0; x<this.wallHeight; x+=constants.brickHeight){
            var x1 = this.box.height/2 + x;
            var x2 = x1 + constants.brickHeight;
            var column = 0;
            //screen.drawLine(x1+ offset.x, 0, x2+offset.x, dimensions.height, "#FF0", constants.lineThickness);
        
            for(y = constants.brickWidth/2; y < this.box.height ; y += constants.brickWidth/2){
                var angle = VC.Trig.pointToAngle(-this.box.height / 2+y, -this.box.height / 2);
                
                    if(column % 2 == row % 2){
                        screen.drawAngleSegmentX(angle, x1, x2, offset.x, offset.y, color, constants.lineThickness);
                        //break;
                    }
                //break;
                column ++;
            }
            if(row>0){
            //    screen.drawLine(Math.round(VC.Trig.cotangent(VC.Trig.degreesToRadians(135)) * y1)+offset.x, y1 + offset.y, Math.round(VC.Trig.cotangent(VC.Trig.degreesToRadians(225)) * y1)+offset.x, y1+offset.y, color, constants.lineThickness);
                screen.drawLine(x1 + offset.x, Math.round(VC.Trig.tangent(VC.Trig.degreesToRadians(135))*x1)+offset.y, x1 + offset.x, Math.round(VC.Trig.tangent(VC.Trig.degreesToRadians(225))*x1)+offset.y, color, constants.lineThickness);
            }
            row++;
        }
    
    }

    findDoor(wall){
        for(i = 0; i<this.doors.length;i++){
            if(this.doors[i].wall == wall){
                return this.doors[i];
            }
        }
        return null;
    }

    constrain(gameObject, x2, y2){
        var x1 = gameObject.box.x;
        var y1 = gameObject.box.y;
        var constrained = new VC.Box(gameObject.box.x, gameObject.box.y, gameObject.box.width, gameObject.box.height);
        //game.player.box
        constrained.x = VC.Math.constrain(this.box.x, x2, this.box.x + this.box.width - gameObject.box.width);
        constrained.y = VC.Math.constrain(this.box.y, y2, this.box.y + this.box.height - gameObject.box.height);
        
        
        //constrain against all other objects
        this.objects.forEach((gameObject2)=>{
            if(gameObject!=gameObject2 && gameObject2.plane == Plane.PHYSICAL && (gameObject2.room == null || gameObject2.room==this)){
                if(constrained.collidesWith(gameObject2.box)){
                    //revert to original
                    constrained.resolveCollision(gameObject2.box);
                }
            }
        })
        if (this.barred) {
            return constrained;
        }
        
        //TODO: move door concerns?
        
        var allowance = Math.round((constants.doorWidth/2)+constants.doorFrameThickness);
        
        if(gameObject == game.player){
            for(var d=0;d<this.doors.length;d++){
                var door = this.doors[d];
                if(!door.opened && game.player.keys.indexOf(door.lock)>-1 && game.player.box.inside(door.box)){
                    door.opened = 1;
                    game.level.findNeighbor(this, door.wall).opened=1;
                    game.level.statistics.doorsUnlocked++;
                    this.#audioChannel.play(SoundEffects.ROOM_OPENED, game.data.sfxVolume, false)
                    this.#doorsRendered = false;
                    
                } else if((!door.opened || door.forceBars) && game.player.box.inside(door.box)) {
                    return constrained;
                }
                switch(door.wall){  
                    case Direction.NORTH:
                        if(game.player.box.inside(door.box) ){
                            if(y2<y1) constrained.x = door.box.center().x - Math.round(game.player.box.width/2);
                            constrained.y = y2;
                            if (game.player.box.collidesWith(door.trip)){
                                game.level.openNextRoom(door.wall);
                                return new VC.Box(game.player.box.x+1, game.player.box.y+1,game.player.box.width, game.player.box.height);
                            }
                        }
                        break;
                    case Direction.EAST:

                        if(game.player.box.inside(door.box) ){
                            if(x2>x1) constrained.y = door.box.center().y;
                            constrained.x = x2;
                            if (game.player.box.collidesWith(door.trip)){
                                game.level.openNextRoom(door.wall);
                                return new VC.Box(game.player.box.x+1, game.player.box.y+1,game.player.box.width, game.player.box.height);
                            }
                        }
                        break;
                    case Direction.SOUTH:
                        if(game.player.box.inside(door.box) ){
                            if(y2>y1) constrained.x = door.box.center().x - Math.round(game.player.box.width/2);
                            constrained.y = y2;
                            if (game.player.box.collidesWith(door.trip)){
                                game.level.openNextRoom(door.wall);
                                return new VC.Box(game.player.box.x+1, game.player.box.y+1,game.player.box.width, game.player.box.height);
                            }
                        }
                        break
                    case Direction.WEST:
                        if(game.player.box.inside(door.box) ){
                            if(x2<x1) constrained.y = door.box.center().y;
                            constrained.x = x2;
                            if (game.player.box.collidesWith(door.trip)){
                                game.level.openNextRoom(door.wall);
                                return new VC.Box(game.player.box.x+1, game.player.box.y+1,game.player.box.width, game.player.box.height);
                            }
                        }
                        break;
                }
            };
        } else {
            for(var d=0;d<this.doors.length;d++){
                var door = this.doors[d];
                if(!door.opened || door.forceBars) {
                    return constrained;
                }
                switch(door.wall){  
                    case Direction.NORTH:
                        if(gameObject.box.inside(door.box) ){
                            constrained.y = VC.Math.constrain(door.box.y+constants.doorFrameThickness, y2, constrained.y);
                            if (gameObject.box.collidesWith(door.trip)){
                                game.level.moveToNextRoom(gameObject, Direction.NORTH)
                                return gameObject.box;
                            }
                        }
                        break;
                    case Direction.EAST:
                        if(gameObject.box.inside(door.box) ){
                            constrained.x = VC.Math.constrain(constrained.x, x2, door.box.x + door.box.width - constants.doorFrameThickness);
                            if (gameObject.box.collidesWith(door.trip)){
                                game.level.moveToNextRoom(gameObject, Direction.EAST)
                                return gameObject.box;
                            }
                        }
                        break;
                    case Direction.SOUTH:
                        if(gameObject.box.inside(door.box) ){
                            constrained.y = VC.Math.constrain(constrained.y, y2, door.box.y + door.box.height - constants.doorFrameThickness);
                            if (gameObject.box.collidesWith(door.trip)){
                                game.level.moveToNextRoom(gameObject, Direction.SOUTH)
                                return gameObject.box;
                            }
                        }
                        break
                    case Direction.WEST:
                        if(gameObject.box.inside(door.box) ){
                            constrained.x = VC.Math.constrain(door.box.x+constants.doorFrameThickness, x2, constrained.y);
                            if (gameObject.box.collidesWith(door.trip)){
                                game.level.moveToNextRoom(gameObject, Direction.WEST)
                                return gameObject.box;
                            }
                        }
                        break;
                }
            };
        }

        return constrained;
    }
    
    spawn(object){
        do {
            object.box.x = this.box.x + Math.round((this.box.width-object.box.width) * Math.random());
            object.box.y = this.box.y + Math.round((this.box.height-object.box.height) * Math.random());
        } while (any(this.objects, (o)=>{return o!=object && o.box.collidesWith(object.box)}) || any(this.doors,(d)=>(d.box.collidesWith(object.box))))
    }

   

}
