//REQUIRES LevelFactory,

class PolygonalRoom extends VC.Scene {
    
    objects=[]
    #deadObjects = [];

    x = 0;
    y = 0;
    box = null;
    #offsetX = 0;
    #offsetY = 0;
    wallHeight = 0;

    region = 0;
    opened = 1;
    barred = 0;
    mapped = 0; //HACK: Still in use?
    isBossRoom = 0;//HACK: Relevance?

    doors = [];
    #triangles = [];
    palette = LevelFactory.getWorldPalette(1);

    #centerPoint = null;
    tileSeed = 0;
    
    structureRendered = false;
    #doorsRendered = false;
    #audioChannel = new VC.AudioChannel();


    get offsetX(){
        return this.#offsetX
    }


    get offsetY(){
        return this.#offsetY
    }
    

    constructor(x, y, w, h, wallHeightInBricks){
        super();
        this.x = x; //map address
        this.y = y; //map address
        this.box = new VC.Box(0,0,w?w:0,h?h:0);
        this.wallHeight = constants.brickHeight * (wallHeightInBricks ? wallHeightInBricks : 5);
        this.tileSeed = Math.floor(Math.random()*100);

        if(this.box.width == 0){
            this.box.width = Math.round((((constants.roomMaxWidthInBricks - constants.roomMinWidthInBricks) * Math.random()) + constants.roomMinWidthInBricks)) * constants.brickWidth;
       
            //this.box.width = 500;
        }
        
        if(this.box.height == 0){
            //this.box.height = 500;
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
            this.#doorsRendered = false;
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



    finalize(){
        var centerPoint = new VC.Point (this.box.x + this.box.width/2, this.box.y + this.box.height/2);

        var triangle_north = null;
        var triangle_south = null;
        var triangle_west = null;
        var triangle_east = null;

        var wallTriangles = []
        var doorpadding = constants.doorFrameThickness + constants.doorWidth/2 + constants.brickWidth/2;
        this.doors.forEach((door)=>{
            switch(door.wall){
                case Direction.NORTH:
                    if (Math.abs(door.offset) > doorpadding/2){
                        if (door.offset>0){
                            triangle_north = new VC.Triangle(
                                centerPoint,
                                new VC.Point(
                                    this.box.x + (this.box.width/2 + door.offset) + doorpadding,
                                    (this.box.y)
                                ),
                                new VC.Point(
                                    this.box.x + (this.box.width/2) - doorpadding / 2,
                                    (this.box.y)
                                )
                            );
                        }else{
                            triangle_north = new VC.Triangle(
                                centerPoint,
                                new VC.Point(
                                    this.box.x + (this.box.width/2) + doorpadding / 2,
                                    (this.box.y)
                                ),
                                new VC.Point(
                                    this.box.x + (this.box.width/2 + door.offset) - doorpadding,
                                    (this.box.y)
                                )
                            );
                        }
                    } else {
                        triangle_north = new VC.Triangle(
                            centerPoint,
                            new VC.Point(
                                this.box.x + (this.box.width/2 + door.offset) + doorpadding,
                                (this.box.y)
                            ),
                            new VC.Point(
                                this.box.x + (this.box.width/2 + door.offset) - doorpadding,
                                (this.box.y)
                            )
                        );
                    }
                    break;
                case Direction.EAST:
                    if (Math.abs(door.offset) > doorpadding/2){
                        if (door.offset>0){
                            triangle_east = new VC.Triangle(
                                centerPoint,
                                new VC.Point(
                                    this.box.x + this.box.width,
                                    this.box.y + (this.box.height/2 + door.offset) + doorpadding
                                ),
                                new VC.Point(
                                    this.box.x + this.box.width,
                                    this.box.y + (this.box.height/2) - doorpadding /2
                                )
                            );
                        }else{
                            triangle_east = new VC.Triangle(
                                centerPoint,
                                new VC.Point(
                                    this.box.x + this.box.width,
                                    this.box.y + (this.box.height/2) + doorpadding/2
                                ),
                                new VC.Point(
                                    this.box.x + this.box.width,
                                    this.box.y + (this.box.height/2 + door.offset) - doorpadding
                                )
                            );
                        }
                    } else {
                        triangle_east = new VC.Triangle(
                            centerPoint,
                            new VC.Point(
                                this.box.x + this.box.width,
                                this.box.y + (this.box.height/2 + door.offset) + doorpadding
                            ),
                            new VC.Point(
                                this.box.x + this.box.width,
                                this.box.y + (this.box.height/2 + door.offset) - doorpadding
                            )
                        );
                    }

                    break;
                case Direction.SOUTH:
                    if (Math.abs(door.offset) > doorpadding/2){
                        if (door.offset>0){
                            triangle_south = new VC.Triangle(
                                centerPoint,
                                new VC.Point(
                                    this.box.x + (this.box.width/2 - door.offset) - doorpadding,
                                    (this.box.y + this.box.height)
                                ),
                                new VC.Point(
                                    this.box.x + (this.box.width/2 ) + doorpadding / 2,
                                    (this.box.y + this.box.height)
                                )
                            );
                        }else{
                            triangle_south = new VC.Triangle(
                                centerPoint,
                                new VC.Point(
                                    this.box.x + (this.box.width/2 ) - doorpadding / 2,
                                    (this.box.y + this.box.height)
                                ),
                                new VC.Point(
                                    this.box.x + (this.box.width/2 - door.offset) + doorpadding,
                                    (this.box.y + this.box.height)
                                )
                            );
                        }
                    } else { 
                        triangle_south = new VC.Triangle(
                            centerPoint,
                            new VC.Point(
                                this.box.x + (this.box.width/2 - door.offset) - doorpadding,
                                (this.box.y + this.box.height)
                            ),
                            new VC.Point(
                                this.box.x + (this.box.width/2 - door.offset) + doorpadding,
                                (this.box.y + this.box.height)
                            )
                        );
                    }
                    break;
                case Direction.WEST:
                    if (Math.abs(door.offset) > doorpadding/2){
                        if (door.offset>0){
                            triangle_west = new VC.Triangle(
                                centerPoint,
                                new VC.Point(
                                    this.box.x,
                                    this.box.y + (this.box.height/2 - door.offset) - doorpadding
                                ),
                                new VC.Point(
                                    this.box.x,
                                    this.box.y + (this.box.height/2 ) + doorpadding / 2
                                )
                            );
                        }else{
                            triangle_west = new VC.Triangle(
                                centerPoint,
                                new VC.Point(
                                    this.box.x,
                                    this.box.y + (this.box.height/2) - doorpadding / 2
                                ),
                                new VC.Point(
                                    this.box.x,
                                    this.box.y + (this.box.height/2 - door.offset) + doorpadding
                                )
                            );
                        }
                    } else { 
                        triangle_west = new VC.Triangle(
                            centerPoint,
                            new VC.Point(
                                this.box.x,
                                this.box.y + (this.box.height/2 - door.offset) - doorpadding 
                            ),
                            new VC.Point(
                                this.box.x,
                                this.box.y + (this.box.height/2 - door.offset) + doorpadding 
                            )
                        );
                    }

                    break;
            }
        })

        wallTriangles.push(triangle_east==null ? new VC.Triangle(centerPoint, new VC.Point(this.box.x + this.box.width, this.box.center().y + constants.brickWidth * 1.5), new VC.Point(this.box.x + this.box.width, this.box.center().y - + constants.brickWidth * 1.5)): triangle_east)
        wallTriangles.push(triangle_north==null ? new VC.Triangle(centerPoint, new VC.Point(this.box.center().x + constants.brickWidth * 1.5, this.box.y), new VC.Point(this.box.center().x - constants.brickWidth * 1.5, this.box.y)): triangle_north)
        wallTriangles.push(triangle_west==null ? new VC.Triangle(centerPoint, new VC.Point(this.box.x, this.box.center().y - constants.brickWidth * 1.5), new VC.Point(this.box.x, this.box.center().y + constants.brickWidth * 1.5)): triangle_west)
        wallTriangles.push(triangle_south==null ? new VC.Triangle(centerPoint, new VC.Point(this.box.center().x - constants.brickWidth * 1.5, this.box.y + this.box.height), new VC.Point(this.box.center().x + constants.brickWidth * 1.5, this.box.y + this.box.height)): triangle_south)

        //determine what to do with each corner
        for(var corner = 0; corner < 4; corner ++){
            var method = VC.Math.random(0,2)
         

            var w1 = wallTriangles[corner];
            var w2 = wallTriangles[(corner+1)%4]
            switch (method){
                case 0://corner;
                    //find intersection point.
                    switch(corner){
                        case 0://ne
                        case 2://sw
                            w1.p3.y = w2.p2.y;
                            w2.p2.x = w1.p3.x;
                            break;
                        case 1://nw
                        case 3://se
                            w1.p3.x = w2.p2.x;
                            w2.p2.y = w1.p3.y;
                            break;
                    }
                    break;
                case 1://hallway
                    switch(corner){
                        case 0://ne
                        case 2://sw
                            var p4 = new VC.Point(w2.p2.x, w1.p3.y)
                            this.#triangles.push(new VC.Triangle(centerPoint, w1.p3, p4));
                            this.#triangles.push(new VC.Triangle(centerPoint, p4, w2.p2));
                            break;
                        case 1://nw
                        case 3://se
                            var p4 = new VC.Point(w1.p3.x, w2.p2.y)
                            this.#triangles.push(new VC.Triangle(centerPoint, w1.p3, p4));
                            this.#triangles.push(new VC.Triangle(centerPoint, p4, w2.p2));
                            break;
                    }
                    break;
                case 2://angle
                    switch(corner){
                        case 0://ne
                            //adjust points
                            var w1Distance = w1.p3.y - this.box.y;
                            var w2Distance = (this.box.x + this.box.width) - w2.p2.x;
                            var distance = Math.min(w1Distance, w2Distance);
                            w1.p3.y = this.box.y + distance;
                            w2.p2.x = this.box.x + this.box.width - distance;
                            this.#triangles.push(new VC.Triangle(centerPoint, w1.p3, w2.p2));
                            break;
                        case 1://nw
                            //adjust points
                            var w1Distance = w1.p3.x - this.box.x;
                            var w2Distance = w2.p2.y - this.box.y;  
                            var distance = Math.min(w1Distance, w2Distance);
                            w1.p3.x = this.box.x + distance;
                            w2.p2.y = this.box.y + distance;
                            this.#triangles.push(new VC.Triangle(centerPoint, w1.p3, w2.p2));
                            break;
                        case 2://sw
                            //adjust points
                            var w1Distance = (this.box.y + this.box.height) - w1.p3.y;
                            var w2Distance = w2.p2.x - this.box.x; 
                            var distance = Math.min(w1Distance, w2Distance);
                            w1.p3.y = this.box.y + this.box.height - distance;
                            w2.p2.x = this.box.x + distance;
                            this.#triangles.push(new VC.Triangle(centerPoint, w1.p3, w2.p2));
                            break;
                        case 3://se
                            
                            var w1Distance = (this.box.x + this.box.width) - w1.p3.x;
                            var w2Distance = (this.box.y + this.box.height) - w2.p2.y;
                            var distance = Math.min(w1Distance, w2Distance);
                            w1.p3.x = this.box.x + this.box.width - distance;
                            w2.p2.y = this.box.y + this.box.height - distance;
                            this.#triangles.push(new VC.Triangle(centerPoint, w1.p3, w2.p2));
                            break;
                            

                    }

            }
        }

        wallTriangles.forEach((w)=>{this.#triangles.push(w);});

        this.#centerPoint = centerPoint;

    }
    angleForPoint(p){
        //case Quadrant 1
        if(p.x>this.#centerPoint.x && p.y>this.#centerPoint.y){
            return VC.Trig.degreesToRadians(45);
        }else if(p.x<this.#centerPoint.x && p.y>this.#centerPoint.y){
            return VC.Trig.degreesToRadians(315);    
        }else if(p.x<this.#centerPoint.x && p.y<this.#centerPoint.y){
            return VC.Trig.degreesToRadians(225);    
        }else if(p.x>this.#centerPoint.x && p.y<this.#centerPoint.y){
            return VC.Trig.degreesToRadians(135);    
        }
    }
  
    intersect(x1, y1, x2, y2, x3, y3, x4, y4) {

        // Calculate the direction of the lines
        var denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
        if (denom === 0) {
            return null; // Lines are parallel
        }

        var ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
        var ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;

        // Calculate the intersection point
        var x = x1 + ua * (x2 - x1);
        var y = y1 + ua * (y2 - y1);
        
        return {x:x, y:y}
    }

    renderStructure(screen){
            //render clip area
            
        screen.drawRect(0, 0, dimensions.width, dimensions.width, this.palette.clipColor, this.palette.clipColor, 0);
        

        //render floor
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
                var visible = false;
                this.#triangles.forEach((t)=>{
                    visible = visible || 
                        t.contains(new VC.Point(x, y)) || 
                        t.contains(new VC.Point(x + w, y)) || 
                        t.contains(new VC.Point(x + w, y + h)) || 
                        t.contains(new VC.Point(x, y + h))
                });
                if(visible){
                    screen.drawRect(x, y, w, h,this.palette.floorColor, this.palette.floorColor, constants.lineThickness)
                    screen.drawRect(x, y, w, h, VC.Color.calculateAlpha(this.palette.floorColor,tiles[t],.25),VC.Color.calculateAlpha(this.palette.floorColor,"#000",.25),1.5)//.attr({opacity:.25});
                }
                t = (t+1) % tiles.length;
            }   
        }

        
        //render walls
        this.#triangles.forEach((t)=>{
            //project along line.
            var point1 = t.p2;
            var distance = Math.sqrt (Math.pow(this.wallHeight,2) + Math.pow(this.wallHeight,2));
            var angle1 = this.angleForPoint(t.p2);
            var point2 = new VC.Point(Math.sin(angle1) * distance + t.p2.x, Math.cos(angle1) * distance + t.p2.y);
            var angle2 = this.angleForPoint(t.p3);
            var point3 = new VC.Point(Math.sin(angle2) * distance + t.p3.x, Math.cos(angle2) * distance + t.p3.y);
            var point4 = t.p3;
            screen.drawPoly(point1.x, point1.y, point2.x, point2.y, point3.x, point3.y, point4.x, point4.y, 0,0,this.palette.wallColor, "#000", 0);
            screen.drawLine(point1.x, point1.y, point2.x, point2.y, "#000", constants.lineThickness);
            screen.drawLine(point3.x, point3.y, point4.x, point4.y, "#000", constants.lineThickness);

            var brickHeight = Math.sqrt (Math.pow(constants.brickHeight,2) + Math.pow(constants.brickHeight,2));
            var rows = this.wallHeight / constants.brickHeight;

            var columns = VC.Trig.distance(t.p2.x, t.p2.y, t.p3.x, t.p3.y) / (constants.brickWidth/2);
            
            for(var c = 0; c<columns; c++){
                var brickPoint1 = new VC.Point(Math.sin(angle1) + t.p2.x, Math.cos(angle1) + t.p2.y);
                var brickPoint2 = new VC.Point(Math.sin(angle2) + t.p3.x, Math.cos(angle2)  + t.p3.y);
                
                var distance = VC.Trig.distance(brickPoint1.x, brickPoint1.y, brickPoint2.x, brickPoint2.y);
                
                var columnDistance = (constants.brickWidth/2) * c
                var mx = brickPoint1.x - (columnDistance * (brickPoint1.x-brickPoint2.x))/distance
                var my = brickPoint1.y - (columnDistance *(brickPoint1.y-brickPoint2.y))/distance
                
                var mortarPoint1 = new VC.Point(mx, my);
                var lastBrickPoint1 = null;
                var lastBrickPoint2 = null; 
            

                for(var r = 0; r<=rows; r++){
                    var i = r * brickHeight;
                    var brickPoint1 = new VC.Point(Math.sin(angle1) * i + t.p2.x, Math.cos(angle1) * i + t.p2.y);
                    var brickPoint2 = new VC.Point(Math.sin(angle2) * i + t.p3.x, Math.cos(angle2) * i + t.p3.y);
                    

                    if(c == 0 && r>0 && r<rows){
                        if(r == 3){
                            if(this.region!=0 || this.palette.regionColor){
                                console.log("drawingPoly")
                                screen.drawPoly(
                                    lastBrickPoint1.x, lastBrickPoint1.y,
                                    brickPoint1.x, brickPoint1.y,
                                    brickPoint2.x, brickPoint2.y,
                                    lastBrickPoint2.x, lastBrickPoint2.y,
                                    0,0,
                                    this.palette.regionColor ? this.palette.regionColor : regionColor(this.region),
                                    "#000", 
                                    0
                                );
                            }                
                        }
    
                        screen.drawLine(brickPoint1.x, brickPoint1.y, brickPoint2.x, brickPoint2.y, "#000", constants.lineThickness);
                    }
                    var angle3=angle2;
                    if (angle2<angle1){
                        angle3 = angle2 + 2 * Math.PI
                    }

          

                    var mortarAngle = VC.Math.percentToRange(columnDistance/distance,angle1,angle3);

                    var mortarPoint2 = new VC.Point(Math.sin(mortarAngle) * brickHeight + mortarPoint1.x, Math.cos(mortarAngle) * brickHeight + mortarPoint1.y)
                    
                    //tweak mortarPoint2
                    var intersection = this.intersect(mortarPoint1.x, mortarPoint1.y, mortarPoint2.x, mortarPoint2.y, brickPoint1.x, brickPoint1.y, brickPoint2.x, brickPoint2.y);
                    if (intersection){
                        mortarPoint2.x = intersection.x;
                        mortarPoint2.y = intersection.y;
                    }
                    
                    if(r > 0 && (r + c) % 2 == 0){
                        screen.drawLine(mortarPoint1.x, mortarPoint1.y, mortarPoint2.x, mortarPoint2.y, "#000", constants.lineThickness);
                    }
                    mortarPoint1 = mortarPoint2;
                    lastBrickPoint1 = brickPoint1;
                    lastBrickPoint2 = brickPoint2;

                }
                //mortarPoint1.render(screen);
            }
        });

        //this.box.render(screen, "#FF0");
    }

    
    findDoor(wall){
        for(i = 0; i<this.doors.length;i++){
            if(this.doors[i].wall == wall){
                return this.doors[i];
            }
        }
        return null;
    }

    boxInside(box){
        var passedPoints = 0;
        var points = [
            new VC.Point(box.x, box.y),
            new VC.Point(box.x + box.width, box.y),
            new VC.Point(box.x + box.width, box.y + box.height),
            new VC.Point(box.x, box.y + box.height),
            
        ]
        points.forEach((p)=>{
            if(any(this.#triangles, (t)=>t.contains(p))){
                passedPoints++;
            }   
        })
        if(passedPoints<4){
            return false;
        }
        return true;    
    }
    
    constrain(gameObject, x2, y2){


        
        var x1 = gameObject.box.x;
        var y1 = gameObject.box.y;

        var constrained = new VC.Box(x2, y2, gameObject.box.width, gameObject.box.height);

        if (!this.boxInside(constrained)){
            //outside of boundaries. 
            constrained.x = x1;
            constrained.y = y1;
            while (!this.boxInside(constrained)){
                //outside of boundaries. 
                constrained.x += constrained.x < this.#centerPoint.x ? 10 : - 10;
                constrained.y += constrained.y < this.#centerPoint.y ? 10 : - 10;
            }       
        }
        
        
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
                                return new VC.Box(game.player.box.x+1, game.player.box.y-10,game.player.box.width, game.player.box.height);
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

            object.box.x = VC.Math.random(this.box.x, this.box.x+this.box.width);
            object.box.y = VC.Math.random(this.box.y, this.box.y+this.box.height);
          
            if(!this.boxInside(object.box)){
                while (!this.boxInside(object.box)){
                    //outside of boundaries. 
                    object.box.x += object.box.x < this.#centerPoint.x ? 10 : - 10;
                    object.box.y += object.box.y < this.#centerPoint.y ? 10 : - 10;
                }        
            }

            var constrained = this.constrain(object, VC.Math.random(this.box.x, this.box.x+this.box.width), VC.Math.random(this.box.y, this.box.y+this.box.height))
            object.box.x = constrained.x;
            object.box.y = constrained.y;
        } while (any(this.objects, (o)=>{return o!=object && o.box.collidesWith(object.box)}) || any(this.doors,(d)=>(d.box.collidesWith(object.box))))
    }

}