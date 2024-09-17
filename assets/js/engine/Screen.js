//REQUIRES VC, Trig

VC.Screen = class {
    #screen = null;
    #width = 0;
    #height = 0;
    constructor(domElementId, x, y, width, height){
        var screen = Raphael(domElementId, width, height);
        screen.setViewBox(x, y, width, height, true);
        screen.canvas.setAttribute('preserveAspectRatio', 'meet');
        screen.canvas.setAttributeNS("http://www.w3.org/XML/1998/namespace", "xml:space","preserve"); 
        this.#screen = screen;
        this.#width = width;
        this.#height = height;
    }

    drawLine(x1,y1,x2,y2,color,thickness){
        var path = "M" + x1 + "," + y1 + "L" + x2 + "," + y2;
        return this.#screen.path(path).attr({"stroke-width": thickness, "stroke":color});
    };

    drawTriangle(x1,y1,x2,y2,x3,y3, translateX, translateY, fillColor, strokeColor, thickness){
        var path =  "M" + (x1 + translateX) + "," + (y1 + translateY) + "L" + (x2 + translateX) + "," + (y2 + translateY) + "L" + (x3 + translateX) + "," + (y3 + translateY) + "Z";
        return this.#screen.path(path).attr({"stroke-width": thickness, "stroke": strokeColor, "fill": fillColor});
    };
    
    drawRect(x,y,w,h,color,strokecolor, thickness){
        return this.#screen.rect(x,y,w,h).attr({"stroke-width": thickness, "stroke":strokecolor, "fill": color});
    };

    drawPoly(x1,y1,x2,y2,x3,y3,x4,y4, translateX, translateY, fillColor, strokeColor, thickness){
        var path =  "M" + (x1 + translateX) + "," + (y1 + translateY) + "L" + (x2 + translateX) + "," + (y2 + translateY) + "L" + (x3 + translateX) + "," + (y3 + translateY) + "L" + (x4 + translateX) + "," + (y4 + translateY) + "Z";
        return this.#screen.path(path).attr({"stroke-width": thickness, "stroke": strokeColor, "fill": fillColor});
    };

    drawEllipse (x1,y1,r1,r2, translateX, translateY, fillColor, strokeColor, thickness){
        var e = this.#screen.ellipse(x1+translateX, y1+translateY, r1, r2)
         e.attr({"stroke-width": thickness, "stroke": strokeColor, "fill": fillColor});
         return e;
    };

    drawAngleSegmentX(angle, startX, endX, translateX, translateY, color, thickness){
        var startY = Math.round(VC.Trig.tangent(angle) * startX);
        var endY = Math.round(VC.Trig.tangent(angle) * endX);
        startX+=translateX; endX += translateX;
        startY+=translateY; endY += translateY;
        return this.drawLine(startX, startY, endX, endY, color, thickness);
    };
    
    drawAngleSegmentY = function(angle, startY, endY, translateX, translateY, color, thickness){
        var startX = Math.round(VC.Trig.cotangent(angle) * startY);
        var endX = Math.round(VC.Trig.cotangent(angle) * endY);
        startX+=translateX; endX += translateX;
        startY+=translateY; endY += translateY;
        return this.drawLine(startX, startY, endX, endY, color, thickness);
    }

    #clearListeners = [];
    clear(){
        var failed=[];
        this.#clearListeners.forEach((f)=>{
            try{
                f();
            } catch(e){
                failed.push(f);
            }
        });
        failed.forEach((f)=>this.#clearListeners.splice(this.#clearListeners.indexOf(f),1));
        this.#screen.clear();
    }

    onClear(handler){
        //register handler
        this.#clearListeners.push(handler);
    }

    fadeTo(color, callback){
        this.drawRect(0,0,this.#width, this.#height, color, color, 1).attr({opacity: 0}).animate({opacity:1}, 350, null, callback);
    }
    
    fadeInFrom(color, callback){
        this.drawRect(0,0,this.#width, this.#height, color, color, 0).attr({opacity: 1}).animate({opacity:0}, 350, null, callback);
    }
    

    //RAPHAEL PASS-THRU

    get bottom(){
        return this.#screen.bottom;
    }

    circle(x, y, r){
        return this.#screen.circle(x, y, r);
    }

    get canvas(){
        return this.#screen.canvas;
    }

    get customAttributes(){
        return this.#screen.customAttributes;
    }

    ellipse(x, y, rx, ry){
        return this.#screen.ellipse(x, y, rx, ry);
    }

    forEach(callback, thisArg){
        return this.#screen.forEach(callback, thisArg);
    }

    getById(id){
        return this.#screen.getById(id);
    }

    getElementByPoint(x, y){
        return this.#screen.getElementByPoint(x, y);
    }

    getFont(family, weight, style, stretch){
        return this.#screen.getFont(family, weight, style, stretch);
    }

    image(src, x, y, width, height){
        return this.#screen.image(src, x, y, width, height);
    }

    path(pathString){
        return this.#screen.path(pathString);
    }
    
    print(x, y, text, font, size, origin, letter_spacing){
        return this.#screen.print(x, y, text, font, size, origin, letter_spacing)
    }

    get raphael(){
        return this.#screen.raphael
    }

    rect(x, y, width, height, r){
        return this.#screen.rect(x, y, width, height, r)
    }

    remove(){
        return this.#screen.remove();
    }

    renderfix(){
        return this.#screen.renderfix();
    }

    safari(){
        return this.#screen.safari();
    }

    set(){
        return this.#screen.set();
    }

    setFinish(){
        return this.
        #screen.setFinish();
    }

    setSize(width, height){
        return this.#screen.setSize(width, height);
    }

    setStart(){
        return this.#screen.setStart();
    }

    setViewBox(x, y, w, h, fit){
        this.#width = w;
        this.#height = h;
        return this.#screen.setViewBox(x, y, w, h, fit);
    }

    text(x, y, text){
        return this.#screen.text(x, y, text)
    }

    get top(){
        return this.#screen.top;
    }
    
}   