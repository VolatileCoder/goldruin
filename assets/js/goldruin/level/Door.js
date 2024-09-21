
class Door {
    level = null;
    room = null;
    wall = 0;
    color = palette.doorDefaultColor;
    atmosphere = "#000";
    offset = 0; 
    forceBars = false;
    elements = [];

    constructor(level, room, wall, offset){
        this.level = level;
        this.room = room;
        this.wall = wall % 4;
        this.offset = offset;
        
    }

    render(screen){
        if(this.elements.length>0){
            //clear previous rendering
            this.elements.forEach((e)=>e.remove());
            this.elements = [];
        }
        if (this.elements.length==0){
            screen.onClear(()=>{this.elements = [];});
            focus={};
            focus.x =  (this.wall == Direction.NORTH || this.wall == Direction.SOUTH ? this.room.box.width : this.room.box.height) / 2
            //focus.x = this.room.box.width /2
            focus.y = VC.Trig.cotangent(VC.Trig.degreesToRadians(45)) * focus.x;
        
            var offset={};
            offset.x = 0;//focus.x + this.room.box.x + this.room.wallHeight;
            offset.y = 0;//focus.y + this.room.box.y + this.room.wallHeight + dimensions.infoHeight;
        
            //DOOR FRAME
            var x1 = this.offset - constants.doorWidth/2 - constants.doorFrameThickness;
            var y1 = -focus.x;
            var x4 = this.offset + constants.doorWidth/2 + constants.doorFrameThickness;
            var y4 = -focus.x;
            var y2 = y1 - constants.doorHeight - constants.doorFrameThickness;
            var x2 = VC.Trig.cotangent(VC.Trig.pointToAngle(y1,x1)) * y2;
            var y3 = y4 - constants.doorHeight - constants.doorFrameThickness;
            var x3 = VC.Trig.cotangent(VC.Trig.pointToAngle(y4,x4)) * y3;
            this.elements.push(screen.drawPoly(x1,y1,x2,y2,x3,y3,x4,y4,offset.x,offset.y,palette.doorFrame,"#000",constants.lineThickness));
        
        
            //DOOR
            x1 = this.offset - constants.doorWidth / 2;
            y1 = -focus.x;
            x4 = this.offset + constants.doorWidth / 2;
            y4 = -focus.x;
            var dy2 = y1 - constants.doorHeight;
            var dx2 = VC.Trig.cotangent(VC.Trig.pointToAngle(y1,x1)) * dy2;
            var dy3 = y4 - constants.doorHeight;
            var dx3 = VC.Trig.cotangent(VC.Trig.pointToAngle(y4,x4)) * dy3;
            
            this.opened = 1;
            if(this.level){
                var portalTo = this.level.findNeighbor(this.room, this.wall);
                if(portalTo){
                    this.opened = portalTo.opened;
                    if(!this.opened){
                        this.lock = portalTo.lock;
                        this.color = regionColor(portalTo.region);
                    }
                }
            }
            
            this.elements.push(screen.drawPoly(x1,y1,dx2,dy2,dx3,dy3,x4,y4,offset.x,offset.y,"#000",constants.lineThickness));
            this.elements.push(screen.drawPoly(x1+10,y1,dx2+10,dy2,dx3-10,dy3,x4-10,y4,offset.x,offset.y,this.atmosphere,constants.lineThickness));

            //THRESHOLD
            x1 = this.offset - constants.doorWidth/2 ;
            y1 = -focus.x + constants.lineThickness - 3;
            x4 = this.offset + constants.doorWidth/2;
            y4 = -focus.x + constants.lineThickness - 3;
            y2 = y1 - constants.thresholdDepth;
            if (x1 > 0){
                x2 = VC.Trig.cotangent(VC.Trig.pointToAngle(y1,x1)) * y2;        
            }else {
                x2 = x1 - ((VC.Trig.cotangent(VC.Trig.pointToAngle(y1,x1)) * y2)-x1)/3;
            }
            
            y3 = y4 - constants.thresholdDepth;
            if (x4 < 0){
                x3 = VC.Trig.cotangent(VC.Trig.pointToAngle(y4,x4)) * y3;      
            }else {
                x3 = x4 - ((VC.Trig.cotangent(VC.Trig.pointToAngle(y4,x4)) * y3)-x4)/3;
            }
            this.elements.push(screen.drawPoly(x1,y1,x2,y2,x3,y3,x4,y4,offset.x,offset.y,"90-" +this.room.palette.floorColor+ ":5-#000:95","#000",0));                
        
            
            if (!this.opened){
                //DOOR
        
                x1 = this.offset - constants.doorWidth / 2;
                y1 = -focus.x - constants.doorFrameThickness;
                x4 = this.offset + constants.doorWidth / 2;
                y4 = -focus.x - constants.doorFrameThickness;
                dy2 = y1 - constants.doorHeight + constants.doorFrameThickness ;
                dx2 = VC.Trig.cotangent(VC.Trig.pointToAngle(y1,x1)) * dy2;
                dy3 = y4 - constants.doorHeight + constants.doorFrameThickness;
                dx3 = VC.Trig.cotangent(VC.Trig.pointToAngle(y4,x4)) * dy3;
                this.elements.push(screen.drawPoly(x1,y1,dx2,dy2,dx3,dy3,x4,y4,offset.x,offset.y,this.color,constants.lineThickness));

                
                //KEYHOLE
                x0 = this.offset;
                y0 = -focus.x;
                
                y1 = -focus.x - constants.doorHeight/5;
                x1 = (VC.Trig.cotangent(VC.Trig.pointToAngle(y0,x0)) * y1) - constants.doorWidth/12;
                
                y4 = -focus.x - constants.doorHeight/5;
                x4 = (VC.Trig.cotangent(VC.Trig.pointToAngle(y0,x0)) * y1) + constants.doorWidth/12;
        
                y2 = y1 - 16;
                x2 = (VC.Trig.cotangent(VC.Trig.pointToAngle(y0,x0)) * y2) -1 ;        
                y3 = y4 - 16;
                x3 = (VC.Trig.cotangent(VC.Trig.pointToAngle(y0,x0)) * y3) +1; 
        
                this.elements.push(screen.drawPoly(x1,y1,x2,y2,x3,y3,x4,y4,offset.x,offset.y,"#000","#000",0));
                
                this.elements.push(screen.drawEllipse( (VC.Trig.cotangent(VC.Trig.pointToAngle(y0,x0)) * y3), y3, 8, 4,offset.x,offset.y,"#000","#000",0));
        
                
            }
        
            if(this.room.barred || this.forceBars){
                
                var bars = 5;
            
                for(i=1;i<bars; i++){
                    var x0 = (this.offset - constants.doorWidth/2) + (constants.doorWidth/bars) * i;
                    var y0 = -focus.x - constants.doorFrameThickness //-this.room.box.width/2;
                    var y1 = y0-constants.doorHeight + constants.doorFrameThickness;
                    var x1 = (VC.Trig.cotangent(VC.Trig.pointToAngle(y0,x0)) * y1);                    
                    
                    this.elements.push(screen.drawLine(x0, y0, x1, y1, "#000", constants.lineThickness*3));
                    this.elements.push(screen.drawLine(x0, y0, x1, y1, palette.doorBarColor, constants.lineThickness));
                    
                }
                this.elements.push(screen.drawLine(dx2, dy2, dx3, dy3, "#000", constants.lineThickness));
                
            }
            var t = ""
            switch (this.wall){
                case Direction.NORTH:
                    t = "t" + Math.round(focus.x + this.room.box.x) + "," + Math.round(focus.y + this.room.box.y);
                    break;
                case Direction.SOUTH:
                    t = "r180,0,0t" + Math.round(focus.x + this.room.box.x) *-1+ "," + Math.round(-focus.y + this.room.box.y + this.room.box.height) *-1;
                    break;
                case Direction.EAST:
                    t = "r90,0,0t" + Math.round(focus.x + this.room.box.y) + "," + Math.round(-focus.y + this.room.box.x + this.room.box.width) * -1;
                    break;
                case Direction.WEST:
                    t = "r270,0,0t" + Math.round(focus.x + this.room.box.y) * -1 + "," + Math.round(focus.y + this.room.box.x);
                    break;
            }      
            this.elements.forEach((element)=>{
                element.transform(t)
            })
            
            if (DEBUG && this.box ){
                this.box.render(game.screen, "#0FF");
            }
            if (DEBUG && this.trip ){
                this.trip.render(game.screen, "#F00");
            }new Door
        }
    
    }

    stabilize(){
        switch(this.wall){
            case Direction.NORTH:
                this.box = new VC.Box(
                    this.room.box.x + this.room.box.width / 2 + this.offset - constants.doorWidth/2,
                    this.room.box.y - this.room.wallHeight,
                    constants.doorWidth,
                    this.room.wallHeight + game.player.box.height * 1.25
                );
                this.trip = new VC.Box(
                    this.room.box.x + this.room.box.width / 2 + this.offset - constants.doorWidth/2,
                    this.room.box.y - game.player.box.height - 25,
                    constants.doorWidth,
                    game.player.box.height  
                );
                break;
            case Direction.EAST:
                this.box = new VC.Box(
                    this.room.box.x + this.room.box.width - game.player.box.width * 1.25,
                    this.room.box.y + this.room.box.height / 2 + this.offset - constants.doorWidth/2,
                    this.room.wallHeight + game.player.box.width * 1.25,
                    constants.doorWidth
                );
                this.trip = new VC.Box(
                    this.room.box.x + this.room.box.width + 35,
                    this.room.box.y + this.room.box.height / 2 + this.offset - constants.doorWidth/2,
                    game.player.box.width,
                    constants.doorWidth
                );
                break;
            case Direction.SOUTH:
                this.box = new VC.Box(
                    this.room.box.x + this.room.box.width / 2 - this.offset - constants.doorWidth/2,
                    this.room.box.y + this.room.box.height - this.room.wallHeight,
                    constants.doorWidth,
                    this.room.wallHeight + game.player.box.height * 1.25
                );
                this.trip = new VC.Box(
                    this.room.box.x + this.room.box.width / 2 - this.offset - constants.doorWidth/2,
                    this.room.box.y + this.room.box.height + 35,
                    constants.doorWidth,
                    game.player.box.height  
                );
                break;
            case Direction.WEST:
                this.box = new VC.Box(
                    this.room.box.x - this.room.wallHeight,
                    this.room.box.y + this.room.box.height / 2 - this.offset - constants.doorWidth/2,
                    this.room.wallHeight + game.player.box.width * 1.25,
                    constants.doorWidth
                );
                this.trip = new VC.Box(
                    this.room.box.x - this.room.wallHeight,
                    this.room.box.y + this.room.box.height / 2 - this.offset - constants.doorWidth/2,
                    game.player.box.width,
                    constants.doorWidth
                );
                break;
            default:
                console.warn({"unexpected wall": wall});  
        }
    }
}
