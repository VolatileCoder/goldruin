//REQUIRES Direction, Team, State, Layer, Plane, GameObject, Character, InvisibleObject, Starburst, TNT, Explosion, Torch, TorchLightEffect, Exit, SpikeTrap, ScorchMark, Treasure, TreasureChest, CaveSpider, Snake, Player, Format, AutoController
const VERSION = "v4.24.09.29.01 BETA"
const DEBUG = false

const SCREENBLACK = "#080808";

const UP_ARROW = 38;
const RIGHT_ARROW = 39;
const DOWN_ARROW = 40;
const LEFT_ARROW = 37;

var ORIENTATION = VC.Orientation.UNSET;

var constants =  {
    brickHeight: 16,
    brickWidth: 50,
    lineThickness: 3,
    doorWidth: 110,
    doorFrameThickness: 10,
    doorHeight: 70,
    thresholdDepth: 20,
    roomMinWidthInBricks: 5,
    roomMinHeightInBricks: 5,
    roomMaxWidthInBricks: 15,
    roomMaxHeightInBricks: 15, 
    spriteFamesPerSecond: 10,
    controllerRadius: 210,
    controllerCrossThickness: 80,
    maxHeartContainers: 25,
    tileWidth: (50 * 1.2)
};

function changeOrientation(){
    if(VC.Client.orientation == VC.Orientation.PORTRAIT){
        document.getElementById("controller").style.display = "block";    
        game.screen.setViewBox(0, -dimensions.infoHeight, dimensions.width, dimensions.height, true);    
        game.infoScreen.setViewBox(0, 0, dimensions.width, dimensions.height, true); 
        return;
    }
    document.getElementById("controller").style.display = "none";
    game.screen.setViewBox(0, -dimensions.infoHeight, dimensions.width, dimensions.width + dimensions.infoHeight, true); 
    game.infoScreen.setViewBox(0, 0, dimensions.width, dimensions.width + dimensions.infoHeight, true);    
}

VC.Client.OnOrientationChange(changeOrientation);



function right(str,chr)
{
    return str.substr(str.length-chr,str.length)
}

const dimensions = {
    width: 910, 
    height: 1618,
    infoHeight: 88,
};

const palette = {
    doorFrame: "#928e85",
    doorDefaultColor: "#4d3737",
    doorBarColor: "#999"
};

function randomEntry(array){
    if(array.length == 0){
        return null;
    }
    index =  Math.floor((array.length-1) * Math.random());
    return array[index]; 
}

function filter(array, fun){
    var array2 = [];
    array.forEach((item)=>{
        if(fun(item)){
            array2.push(item);
        }
    })
    return array2;
}

function remove(array, fun){
    itemsToDelete = filter(array,fun);
    itemsToDelete.forEach((item)=>{
        array.splice(array.indexOf(item),1);
    });
}

function any(array, fun){
    if(!array){
        return false;
    }
    for(var i=0;i<array.length; i++){
        if(fun(array[i], i)){
            return true;
        }
    }
    return false;
}






function waitForAttack(callback){
    input = game.player.controller.read();
    if(input.a){
        callback();
        return;
    }
    setTimeout(()=>{waitForAttack(callback)},50);
}

function regionColor(region){
    switch (region){
        case Treasure.SILVERKEY:
            return "#606060";
        case Treasure.GOLDKEY:
            return "#997700";
        case Treasure.REDKEY:
            return "#600000";
        case Treasure.GREENKEY: 
            return "#006000";
        case Treasure.BLUEKEY: 
            return "#000070";
    }
    return "#864";
}

function drawMap(){
    var screen = game.screen;
    var level = game.level;
    var roomSize=10;
    var roomMargin=1;
    var extents = level.extents();
    level.rooms.forEach((r)=>{
        var extentRoom = (extents.indexOf(r) > -1)
        var centerX = dimensions.width/2 + r.x * (roomSize + roomMargin * 2);
        var centerY = dimensions.width/2 + r.y * (roomSize + roomMargin * 2);
        screen.drawRect(centerX-roomSize/2,centerY-roomSize/2, roomSize, roomSize, r.x==0 && r.y==0 ? "#00FF88" : regionColor(r.region), extentRoom ? "#fff": "#000",1);
        r.doors.forEach((d)=>{
            switch(d.wall){
                case Direction.NORTH:
                    screen.drawRect(centerX-2, centerY - roomSize/2 - roomMargin, 4, roomMargin, "#FFF","#000", 0);
                    break;
                
                case Direction.EAST:
                    screen.drawRect(centerX + roomSize/2, centerY - 2, roomMargin, 4, "#FFF","#000", 0);
                    break;
                case Direction.SOUTH:
                    screen.drawRect(centerX-2, centerY + roomSize/2, 4, roomMargin, "#FFF","#000", 0);
                    break;
                case Direction.WEST:
                    screen.drawRect(centerX- roomSize/2 - roomMargin, centerY - 2, roomMargin, 4, "#FFF","#000", 0);
                    break;
            }
        })
    });
}

tiles=[];
for(var i=0; i<100; i++){
    switch(Math.round(Math.random()*7)%7){
        case 0:
            tiles.push("#555555");
        case 1:
            tiles.push("#565656");
        case 2:
            tiles.push("#646464");
        case 3:
            tiles.push("#545454");
        case 4:
            tiles.push("#575454");
        case 5:
            tiles.push("#545457");
        case 6:
            tiles.push("#545754");
    }
}



function pause(){
    if(game && game.level && game.state == VC.GameState.RUNNING){
        game.pause();
        text = game.screen.text(dimensions.width/2, dimensions.infoHeight * 5,"- PAUSED -")
        text.attr({ "font-size": "64px", "font-family": "monospace", "fill": "#FFF", "text-anchor": "center"});
        //Howler.mute(true);
        waitForAttack(()=>{
            game.play();
            //Howler.mute(false);
            text.remove();
        });
    }
}