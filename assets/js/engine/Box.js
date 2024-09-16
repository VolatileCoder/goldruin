class Box {
    x=0;
    y=0;
    width=0;
    height=0;
    constructor(x,y,w,h){
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
    }

    reset(newX, newY, newW, newH){
        this.x = newX;
        this.y = newY;
        this.width = newW;
        this.height = newH;
    }
    
    center() {
        return {
            x: this.x + Math.round(this.width/2),
            y: this.y + Math.round(this.height/2)
        }
    }
    inside(box){
        if(
            box && 
            this.x >= box.x && this.x <= box.x + box.width &&
            this.x + this.width >= box.x && this.x + this.width <= box.x + box.width &&
            this.y >= box.y && this.y <= box.y + box.height &&
            this.y + this.height >= box.y && this.y + this.height <= box.y + box.height
        ){
            return true;
        }
        return false;
    }

    collidesWith(box){

            // Check for overlap along the X axis
            if (this.x + this.width < box.x || this.x > box.x + box.width) {
                return false;
            }

            // Check for overlap along the Y axis
            if (this.y + this.height < box.y || this.y > box.y + box.height) {
                return false;
            }

            // If there is overlap along all axes, collision has occurred
            return true;
    }
    resolveCollision(box){

        var overlapX = Math.min(this.x + this.width, box.x + box.width) - Math.max(this.x, box.x);
        var overlapY = Math.min(this.y + this.height, box.y + box.height) - Math.max(this.y, box.y);
    
        if (overlapX > 0 && overlapY > 0) {
            let mtvX = 0;
            let mtvY = 0;
    
            if (overlapX < overlapY) {
                mtvX = this.center().x < box.center().x ? 1 : -1;
            } else {
                mtvY = this.center().y < box.center().y ? 1 : -1;
            }
            this.x -= mtvX * overlapX;
            this.y -= mtvY * overlapY;
        }
    }
    intersectRect(box) {
        var left = Math.max(this.x, box.x);
        var top = Math.max(this.y, box.y);
        var right = Math.min(this.x + this.width, box.x + box.width);
        var bottom = Math.min(this.y + box.height, box.y + box.height);
        
        // Check if there's an actual intersection
        if (left < right && top < bottom) {
            return new Box(left, top, right-left, bottom-top);
        } else {
            // No intersection
            return null;
        }
    }
    distance(box){
        var c1 = this.center();
        var c2 = box.center();
        var dx = c2.x - c1.x;
        var dy = c2.y - c1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    render(color){
        if(!this.element){ 
            this.element = game.screen.rect(this.x, this.y, this.width, this.height).attr("stroke", color);
            game.screen.onClear(()=>{this.element = null});
        };
        this.element.attr({x:this.x, y:this.y, width: this.width, height: this.height});
    }
    remove(){
        if(this.element){
            this.element.remove();
            this.element = null;
        }   
    }
}
