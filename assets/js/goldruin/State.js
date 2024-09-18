class State {
    static get DEAD(){
        return -1;
    }
    static get IDLE(){
        return 0;
    }
    static get WALKING(){
        return 1;
    }
    static get ATTACKING(){
        return 2;
    }
    static get HURT(){
        return 3;
    }
    static get DYING(){
        return 4;
    }
    static get THROWING(){
        return 5;
    }
}