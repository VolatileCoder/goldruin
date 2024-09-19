//REQUIRES GameObject, ControllerBase, State

class Character extends GameObject{
    health = 0;
    maxHealth = 0;
    damage = 0;
    _attackDuration = 500;
    _attackCooldown = 1000;
    _hurtDuration = 500;
    controller = null;
    constructor(controller){
        super();
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
            var constrained = game.currentRoom.constrain(this,
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
                game.level.statistics.damageReceived += damage;
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
            constrained = game.currentRoom.constrain(this, x, y);

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




function newGameCharacter(){
    var character = newGameObject();
    character.health = 0;
    character.maxHealth = 0;
    character.damage = 0;
    character._attackDuration = 500;
    character._attackCooldown = 1000;
    character._hurtDuration = 500;
    character.controller = newControllerBase();
    character.move = function(deltaT) {
        
        if(this.state == State.DYING){
            if(Date.now()-this._stateStart <= 700){
                return;
            }
            this.setState(State.DEAD);
        }
        if(this.state == State.DEAD){
            return;
        }
        if(this.state == State.HURT){
            if(Date.now()-this._stateStart < this._hurtDuration){
                return
            }
            this.state = State.IDLE;
        }
        if(this.state == State.ATTACKING){
            if(Date.now()-this._stateStart < this._attackDuration){
                return
            }
            this.state = State.IDLE;
        }           
        //read controller
        input = this.controller.read(this);
        
        if(input.a && this.canAttack()){
            this.attack();
        }

        if(this.state == State.IDLE || this.state == State.WALKING || this.state==State.THROWING ){
            if (input.y<0){
                this.direction=Direction.NORTH;
            }else if(input.x>0){
                this.direction=Direction.EAST;
            }else if(input.y>0){
                this.direction=Direction.SOUTH;
            }else if(input.x<0){
                this.direction=Direction.WEST;
            }

            multiplier = 1
            if (Math.abs(input.x)==1 && Math.abs(input.y)==1){
                multiplier = 1/Math.sqrt(2);
            }
            constrained = game.currentRoom.constrain(this,
                this.box.x + input.x * this.speed/1000 * multiplier * deltaT,
                this.box.y + input.y * this.speed/1000 * multiplier * deltaT
            )
            if(this.state == State.THROWING) return;

            if (constrained && (this.box.x != constrained.x || this.box.y != constrained.y)){
                if (this.state!=State.WALKING){
                    this.setState(State.WALKING);
                }
                this.box.x = constrained.x;
                this.box.y = constrained.y;
            }
            else {
                if (this.state!=State.IDLE){
                    this.setState(State.IDLE);
                }
            }   
        }
    };

    character.hurt = function(damage, knockback){
        if(this.state!=State.HURT && this.state!=State.DEAD){
            this.health -= damage;
            if(this == game.player){
                game.level.statistics.damageReceived += damage;
            }
            x = this.box.x;
            y = this.box.y;
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
            constrained = game.currentRoom.constrain(this, x, y);

            if(constrained){

                this.box.x = constrained.x;
                this.box.y = constrained.y;
    
            }
            if(this.health <= 0){
                this.health = 0;
                this.setState(State.DYING);
                return;
            }
            this.setState(State.HURT);
        }
    };

    character.canAttack = function(){
            if(!this._lastAttack || Date.now() - this._lastAttack > this._attackCooldown){
                return true;
            }
            return false;
    };
    character.attack = function(){
            console.warn("unimplemented: attack()");
    };
    character.getObjectsInView = function(){
            return [];
    };
    character.getObjectsInRangeOfAttack = function(){
            console.warn("unimplemented: getObjectsInRangeOfAttack()");
            return [];
    };
    return character
}
