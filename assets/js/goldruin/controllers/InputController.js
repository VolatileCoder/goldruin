//REQUIRES Controller

class InputController extends Controller {
    
    screen = null;
    gamepads = [];

    constructor(){
        super();
        this.screen = new VC.Screen("controller", 0, 0, dimensions.width, dimensions.height);
        var controller = this;
        window.onkeyup = function(e){
            switch (e.key){
                case "w":
                case "W":
                    controller.up = 0;
                    break;    
                case "s":
                case "S":
                    controller.down = 0;
                    break;
                case "a":
                case "A":
                    controller.left = 0;
                    break;
                case "d":
                case "D":
                    controller.right = 0;
                    break;
                case " ":
                    controller.attack = 0;
                    break;
                default:
                    switch (e.keyCode){
                        case UP_ARROW:
                            controller.up = 0;
                            break;
                        case RIGHT_ARROW:
                            controller.right = 0;
                            break;
                        case DOWN_ARROW:
                            controller.down = 0;
                            break;
                        case LEFT_ARROW:
                            controller.left = 0;
                            break;
                        default:
                            return true;
                    }
            }
            e.handled= true;
            e.preventDefault();
            return false;
        };
        
        window.onkeydown = function(e){
            switch (e.key){
                case "w":
                case "W":
                    controller.up = 1;
                    break;
                case "s":
                case "S":
                    controller.down = 1;
                    break;
                case "a":
                case "A":
                    controller.left = 1;
                    break;
                case "d":
                case "D":
                    controller.right = 1;
                    break;
                case " ":
                    controller.attack = 1;
                    break;
                default:
                    switch (e.keyCode){
                        case UP_ARROW:
                            controller.up = 1;
                            break;
                        case RIGHT_ARROW:
                            controller.right = 1;
                            break;
                        case DOWN_ARROW:
                            controller.down = 1;
                            break;
                        case LEFT_ARROW:
                            controller.left = 1;
                            break;
                        default:
                            return true;
                    }
            }
        
            e.handled= true;
            e.preventDefault();
            return false;
        };
    }

    touchStartOrMove(e){
        e.preventDefault(e);
        //setVC.OrientationPortrait();
        
        var button = this.elements[this.elements.length-3];
        var dpad = this.elements[this.elements.length-2];
        var controller = this.elements[this.elements.length-1];
        
        var r = e.target.getBoundingClientRect();
     
        //r.y = r.y - dimensions.infoHeight - dimensions.width
        var touches = Array.from(e.touches);
        var dpadTouched = false;
        var buttonTouched = false;
        touches.forEach((t)=>{   
            
            //console.log(r,t,this.screen);
            //console.log(t);


            var x = (((t.clientX - r.x)/r.width))//*constants.controllerRadius*2) - constants.controllerRadius;
            var y = (((t.clientY - r.y)/r.height))//*constants.controllerRadius*2) - constants.controllerRadius;// * dimensions.height;
            x = x * controller.attr("width");
            y = y * controller.attr("height") + (dimensions.width + dimensions.infoHeight);

            var d = dpad.getBBox();
            
            if(x>d.x && x<d.x + d.width && y>d.y && y<d.y+d.width){
                dpadTouched = true;
                //this.screen.drawRect(x,y, 10, 10, "#FF0", "#000",0)

                x = ((x - d.x)-d.width/2)/(d.width/2);
                y = ((y - d.y)-d.height/2)/(d.height/2)
                d = Math.abs(VC.Trig.radiansToDegrees(Math.atan(y/x)));
                this.up = y < 0 && d > 23 ? 1 : 0;
                this.right = x > 0 && d < 68 ? 1 : 0;
                this.down = y > 0 && d > 22 ? 1 : 0;
                this.left = x < 0 && d < 68 ? 1 : 0;
            }
            
            var b = button.getBBox();
            if(x>b.x && x<b.x + b.width && y>b.y && y<b.y+b.width){
                dpadTouched = true;
                buttonTouched = true;
                this.attack = true;
            }

        })
        if(!dpadTouched){
            this.up = 0;
            this.right = 0;
            this.down =  0;
            this.left = 0;
        }
        if(!buttonTouched){
            this.attack = 0;
        }
    }

    render(){
        var centerY = Math.round((dimensions.height - dimensions.width - dimensions.infoHeight)/2 + dimensions.width + dimensions.infoHeight);
        var dPadLeft = Math.round(dimensions.width/4);  
        if (this.elements.length ==0){
            
            //mask lower screen
            this.screen.drawRect(-5, dimensions.width + dimensions.infoHeight, dimensions.width+10, dimensions.height, "#000", "#000", 0);

            var color="#242424";
            this.screen.rect(0, dimensions.width + dimensions.infoHeight + 25, dimensions.width, dimensions.height - dimensions.width - dimensions.infoHeight - 50).attr({"fill":color, "r": 100});
            color = "#3a3a3a";
            this.elements.push(this.screen.drawEllipse(dPadLeft, centerY, constants.controllerRadius, constants.controllerRadius,0,0,color,"#000",constants.lineThickness));
            color = "#444444";
            this.elements.push(this.screen.drawRect(dPadLeft - constants.controllerCrossThickness/2, centerY - constants.controllerRadius, constants.controllerCrossThickness, constants.controllerRadius*2,color, "#000",constants.lineThickness))
            this.elements.push(this.screen.drawRect(dPadLeft - constants.controllerRadius, centerY - constants.controllerCrossThickness/2, constants.controllerRadius*2, constants.controllerCrossThickness,color, "#000",constants.lineThickness))
            this.elements.push(this.screen.drawRect(dPadLeft - constants.controllerCrossThickness/2, centerY - constants.controllerCrossThickness/2-constants.lineThickness/2, constants.controllerCrossThickness, constants.controllerCrossThickness + constants.lineThickness,color, color,0))
            this.elements.push(this.screen.drawLine(dPadLeft - constants.controllerCrossThickness/2, centerY - constants.controllerCrossThickness/2, dPadLeft + constants.controllerCrossThickness/2, centerY + constants.controllerCrossThickness/2,"#000",constants.lineThickness))
            this.elements.push(this.screen.drawLine(dPadLeft + constants.controllerCrossThickness/2, centerY - constants.controllerCrossThickness/2, dPadLeft - constants.controllerCrossThickness/2, centerY + constants.controllerCrossThickness/2,"#000",constants.lineThickness))
            var arrowMargin = 4 * constants.lineThickness;
            var arrowHeight = 40;
            color = "#303030";
            this.elements.push(this.screen.drawTriangle(
                dPadLeft, centerY - constants.controllerRadius + arrowMargin,
                dPadLeft + constants.controllerCrossThickness/2 - arrowMargin, centerY - constants.controllerRadius + arrowHeight, 
                dPadLeft - constants.controllerCrossThickness/2 + arrowMargin, centerY - constants.controllerRadius + arrowHeight,  
                0,0, color, "#000",0//constants.lineThickness
            ));
            this.elements.push(this.screen.drawTriangle(
                dPadLeft + constants.controllerRadius - arrowMargin, centerY,
                dPadLeft + constants.controllerRadius - arrowHeight, centerY + constants.controllerCrossThickness/2 - arrowMargin, 
                dPadLeft + constants.controllerRadius - arrowHeight, centerY - constants.controllerCrossThickness/2 + arrowMargin,  
                0,0, color, "#000",0
            ));
            this.elements.push(this.screen.drawTriangle(
                dPadLeft, centerY + constants.controllerRadius - arrowMargin,
                dPadLeft + constants.controllerCrossThickness/2 - arrowMargin, centerY + constants.controllerRadius - arrowHeight, 
                dPadLeft - constants.controllerCrossThickness/2 + arrowMargin, centerY + constants.controllerRadius - arrowHeight,  
                0,0, color, "#000",0
            ));
            this.elements.push(this.screen.drawTriangle(
                dPadLeft - constants.controllerRadius + arrowMargin, centerY,
                dPadLeft - constants.controllerRadius + arrowHeight, centerY + constants.controllerCrossThickness/2 - arrowMargin, 
                dPadLeft - constants.controllerRadius + arrowHeight, centerY - constants.controllerCrossThickness/2 + arrowMargin,  
                0,0, color, "#000",0
            ));
            
            
            var txt1 = this.screen.text(Math.round(dimensions.width*.75), centerY - 180, "TAP TO WHIP").attr({ "font-size": "32px", "font-family": "monospace", "fill": "#CCC", "text-anchor": "middle", "font-weight": "bold"});  
            this.elements.push(txt1);
            
            var txt1 = this.screen.text(Math.round(dimensions.width*.75), centerY + 180, "HOLD FOR TNT").attr({ "font-size": "32px", "font-family": "monospace", "fill": "#CCC", "text-anchor": "middle", "font-weight": "bold"});  
            this.elements.push(txt1);

            var el = this.screen.drawEllipse(Math.round(dimensions.width*.75), centerY, constants.controllerRadius/2, constants.controllerRadius/2,0,0,"#800","#000",constants.lineThickness);
            this.elements.push(el);

            var el2 = this.screen.drawEllipse(dPadLeft, centerY, constants.controllerRadius, constants.controllerRadius,0,0,"90-rgba(200,200,200,0.05)-rgba(0,0,0,0.2):50","#000",constants.lineThickness).attr({"opacity":.2})
            this.elements.push(el2);

            var el3 = this.screen.drawRect(0, dimensions.width + dimensions.infoHeight, dimensions.width, dimensions.height-(dimensions.width + dimensions.infoHeight),"#000","#000",constants.lineThickness).attr({"opacity":.1})
            el3.touchstart((e)=>{this.touchStartOrMove(e)});
            el3.touchmove((e)=>{this.touchStartOrMove(e)});
            el3.touchend((e)=>{this.touchStartOrMove(e)});
            this.elements.push(el3);
        }

        var butt = this.elements[this.elements.length-3];
        butt.attr({fill:this.attack ? "#600" : "#800"})

        var el = this.elements[this.elements.length-2];
        //read controller
        var x = this.left * -1 + this.right;
        var y = this.up * -1  + this.down;

        var degrees = 0;
        //read state
        if(x == 0 && y == 0){
            el.hide();
            return;
        }
        degrees = 
            x == -1 && y == 1 ? 225 :
            x == 1 && y == -1 ? 45 :
            x == -1 && y == -1 ? 315 :
            x == 1 && y == 1 ? 135 :
            x == -1 ? 270 :
            x == 1 ? 90 :     
            y == -1 ? 0 :
            y == 1 ? 180 : 
            0 ;
        el.show();
        el.transform("r" + degrees + "," + dPadLeft + "," + centerY);
    }

    read(forObject){
        //read joysticks
        this.gamepads = navigator.getGamepads();
        if(this.gamepads && this.gamepads.length>0){
            var gamepad = this.gamepads[0];
            if (gamepad != null){
                this.attack = (gamepad.buttons && gamepad.buttons.length>0 && gamepad.buttons[0]!=null && gamepad.buttons[0].pressed);
                if(gamepad.axes && gamepad.axes.length>1){
                    this.right = Math.round(gamepad.axes[0])>0;
                    this.left = Math.round(gamepad.axes[0])<0;
                    
                    this.down = Math.round(gamepad.axes[1])>0;
                    this.up = Math.round(gamepad.axes[1])<0;
                        
                }
            }
        }
        return super.read(forObject);
    }
}