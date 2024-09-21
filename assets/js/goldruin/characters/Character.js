//REQUIRES GameObject, ControllerBase, State

class Character extends GameObject{
    health = 0;
    maxHealth = 0;
    damage = 0;
    _attackDuration = 500;
    _attackCooldown = 1000;
    _hurtDuration = 500;
    controller = null;
    gold = 0;
    keys = [];
    tntCount = 0;
    constructor(room, controller){
        super(room);
        this.controller = controller;
    }

    get canAttack(){
        if(!this._lastAttack || Date.now() - this._lastAttack > this._attackCooldown){
            return true;
        }
        return false;
    }

    move(deltaT) {
        if(this.state == State.DYING){
            if(Date.now()-this._stateStart <= 700){
                return;
            }
            this.state = State.DEAD;
        }
        if(this.state == State.DEAD){
            return;
        }
        if(this.state == State.HURT){
            if(Date.now()-this._stateStart < this._hurtDuration){
                return;
            }
            this.state = State.IDLE;
        }
        if(this.state == State.ATTACKING){
            if(Date.now()-this._stateStart < this._attackDuration){
                return;
            }
            this.state = State.IDLE;
        }           
        //read controller
        var input = this.controller.read(this);
        
        if(input.a && this.canAttack){
            this.attack();
        }

        if(this.state == State.IDLE || 
           this.state == State.WALKING || 
           this.state == State.THROWING ){
            if (input.y<0){
                this.direction=Direction.NORTH;
            }else if(input.x>0){
                this.direction=Direction.EAST;
            }else if(input.y>0){
                this.direction=Direction.SOUTH;
            }else if(input.x<0){
                this.direction=Direction.WEST;
            }

            var multiplier = 1
            if (Math.abs(input.x)==1 && Math.abs(input.y)==1){
                multiplier = 1/Math.sqrt(2);
            }
            var constrained = this.room.constrain(this,
                this.box.x + input.x * this.speed/1000 * multiplier * deltaT,
                this.box.y + input.y * this.speed/1000 * multiplier * deltaT
            )

            if(this.state == State.THROWING) return;

            if (constrained && (this.box.x != constrained.x || this.box.y != constrained.y)){
                if (this.state!=State.WALKING){
                    this.state = State.WALKING;
                }
                this.box.x = constrained.x;
                this.box.y = constrained.y;
            }
            else {
                if (this.state!=State.IDLE){
                    this.state = State.IDLE;
                }
            }   
        }
    }

    attack(){
        console.warn("unimplemented: attack()");
    }

    hurt(damage, knockback){
        if(this.state != State.HURT && this.state != State.DEAD){
            this.health -= damage;
            if(this == game.player){
                if(game && game.level && game.level.statistics) {
                    game.level.statistics.damageReceived += damage;
                }
            }
            var x = this.box.x;
            var y = this.box.y;
            switch (knockback){
                case Direction.NORTH:
                    y = this.box.y - damage;
                    break;
                case Direction.EAST:
                    x = this.box.x + damage;
                    break;
                case Direction.SOUTH: 
                    y = this.box.y + damage;
                    break;
                case Direction.WEST:
                    x = this.box.x - damage;
                    break;
            }
            var constrained = this.room.constrain(this, x, y);

            if(constrained){

                this.box.x = constrained.x;
                this.box.y = constrained.y;
    
            }

            if(this.health <= 0){

                this.health = 0;
                this.state = State.DYING;
                return;
            
            }
            this.state = State.HURT;
        }
    }

    getObjectsInView(){
            console.warn("unimplemented: getObjectsInView()");
            return [];
    }
    getObjectsInRangeOfAttack(){
            console.warn("unimplemented: getObjectsInRangeOfAttack()");
            return [];
    }
}
