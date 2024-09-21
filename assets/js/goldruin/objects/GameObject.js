//REQUIRES Layer, Team, Plane, Direction
class GameObject{
    box = new VC.Box(0,0,50,50);
    direction = Direction.NORTH;
    layer = Layer.DEFAULT;
    plane = Plane.PHYSICAL;
    team = Team.UNALIGNED;
    _stateStart =  Date.now();
    _lastAttack =  new Date(0);

    constructor(room){
        this.room = room;
    }

    #room = null;
    get room(){
        return this.#room;
    }
    set room(nextRoom){
        if (this.#room && (this.#room instanceof Room)){
            var currentIndex = this.#room.objects.indexOf(this);
            if (currentIndex>-1){
                this.#room.objects.splice(currentIndex, 1);
            }
        }
        this.#room = nextRoom;
        if(this.#room && (this.#room instanceof Room)){
            this.#room.objects.push(this);
        }
    }

    
    #state = State.IDLE
    get state() {
        return this.#state;
    }
    set state(value){
        if (value!=this.#state){
            this.#state = value;
            this._stateStart = Date.now()
            if(this.state==State.ATTACKING){
                this._lastAttack = Date.now();
            }
        }
    }
    move(deltaT) {
        console.warn("unimplemented: move()");
    }
    render(deltaT, screen){
        console.warn("unimplemented: render()");
        this.box.render(screen, "#F0F");
    }
    remove(){
        console.warn("unimplemented: remove()");
        this.box.remove();
    }

}


function newGameObject(){
    return {
        box: new VC.Box(0,0,50,50),
        direction: Direction.NORTH,
        state: State.IDLE,
        layer: Layer.DEFAULT,
        plane: Plane.PHYSICAL,
        team: Team.UNALIGNED,
        _stateStart: Date.now(),
        setState: function(state){
            if (state!=this.state){
                this.state = state;
                this._stateStart = Date.now()
                if(state==State.ATTACKING){
                    this._lastAttack = Date.now();
                }
            }
        },
        move: function(deltaT) {
            console.warn("unimplemented: move()");
        },
        render: function(deltaT){
            console.warn("unimplemented: render()");
            this.box.render(screen, "#F0F");
        },
        remove: function(){
            console.warn("unimplemented: remove()");
            this.box.remove();
        }
    }
}