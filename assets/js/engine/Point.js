//REQUIRES VC

VC.Point = class {
    #element = null;
    x = 0;
    y = 0;
    constructor (x,y){
        this.x = x;
        this.y = y;
    }
    render(screen){
        if (this.#element){
            this.remove();
        }
        this.#element = screen.drawRect(this.x-1,this.y-1, 3, 3, "#fff","#000",0);
        screen.onClear(this.remove)
    }
    remove(){
        if(this.#element){
            this.#element.remove();
            this.#element = null;
        }
    }
}