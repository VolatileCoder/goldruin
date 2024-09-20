class Controller{
    up = 0;
    left = 0;
    down= 0;
    right = 0;
    attack = 0;
    elements = [];
    read(forObject){
        return {
            x: this.left * -1 + this.right,
            y: this.up * -1  + this.down,
            a: this.attack    
        }
    }
}