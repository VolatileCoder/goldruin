//REQUIRES VC
VC.Triangle = class {

    #p1 = new VC.Point(0,0);
    #p2 = new VC.Point(0,0);
    #p3 = new VC.Point(0,0);
    #elements = []
    constructor(p1, p2, p3){
        this.p1 = p1;
        this.p2 = p2;
        this.p3 = p3;
    }

    get p1() {
        return this.#p1;
    }
    set p1(value){
        if(!(value instanceof VC.Point)){
            throw ("VC.Point expected!")
        }
        this.#p1 = value;
    }
    
    get p2() {
        return this.#p2;
    }
    set p2(value){
        if(!(value instanceof VC.Point)){
            throw ("VC.Point expected!")
        }
        this.#p2 = value;
    }
    
    get p3() {
        return this.#p3;
    }
    set p3(value){
        if(!(value instanceof VC.Point)){
            throw ("VC.Point expected!")
        }
        this.#p3 = value;
    }

    render(screen){
        if(this.#elements.length>0){
            this.remove();
        }
        this.p1.render(screen);
        this.p2.render(screen);
        this.p3.render(screen);
        this.#elements.push(screen.drawLine(this.p1.x, this.p1.y, this.p2.x, this.p2.y, "#00F", 1));
        this.#elements.push(screen.drawLine(this.p2.x, this.p2.y, this.p3.x, this.p3.y ,"#00F", 1));
        this.#elements.push(screen.drawLine(this.p3.x, this.p3.y, this.p1.x, this.p1.y, "#00F", 1));
        screen.onClear(this.remove)
    }

    remove(){
        if(this.#elements.length>0){
            this.p1.remove();
            this.p2.remove();
            this.p3.remove();
            this.#elements.forEach((element)=>element.remove());
            this.#elements = [];
        }
    }

    contains(obj){
        if(obj instanceof VC.Point) {
            var d1 = this.#sign(obj, this.p1, this.p2);
            var d2 = this.#sign(obj, this.p2, this.p3);
            var d3 = this.#sign(obj, this.p3, this.p1);
        
            var has_neg = (d1 < 0) || (d2 < 0) || (d3 < 0);
            var has_pos = (d1 > 0) || (d2 > 0) || (d3 > 0);
        
            return !(has_neg && has_pos);
        }
        if (obj instanceof VC.Box){
            return this.contains(new VC.Point(obj.x, obj.y)) && this.contains(new VC.Point(obj.x + obj.width, obj.y)) && this.contains(new VC.Point(obj.x + obj.width, obj.y + obj.height)) && this.contains(new VC.Point(obj.x, obj.y + obj.height))
        }
        
        if (obj instanceof VC.Triangle){
            return this.contains(obj.p1) && this.contains(obj.p2) && this.contains(obj.p3)
        }
        return false;
    }

    #sign (p1,p2,p3)
    {
        return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
    }
}