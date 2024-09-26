//REQUIRES Character, Direction, Team, State, SoundEffects

class Adventurer extends Character{
    
    sprite = null;//HACK: Made public for exit steps
    attackBegin = null;
    #whip = {
        thickness: 5,
        length: 175, 
        box: new VC.Box(0,0,0,0)
    }

    constructor(room,controller){
        super(room,controller);
        this.box.x = Math.round(dimensions.width / 2)-25;
        this.box.y = Math.round(dimensions.width / 2)-25;
        this.box.width = 50;
        this.box.height = 50;
        this.direction = Direction.SOUTH; //init facing the player
        this.team = Team.HEROIC;
        this.speed = 150; //in px/sec
        this.damage = 10;
        this.health = 30;
        this.tnt = 5;
        this.maxHealth = 30;
        this._attackDuration = 250;
        this._attackCooldown = 750;
    }
    
    move(deltaT){
        if(this.state != State.DYING && this.state != State.DEAD){
            if(this.attackBegin != null && this.controller.read().a == 0){
                if(this.state == State.THROWING){
                    this.#tntAttack();
                } else {
                    this.#whipAttack();
                }
                this.attackBegin = null
            }
        }
        var state1 = this.state;
        super.move(deltaT);
        if(this.state!=state1){
            if(this.state==State.WALKING){
                this.playSound(0, SoundEffects.FOOTSTEPS, .2, true, false);
            }else{
                this.stopSound(0, SoundEffects.FOOTSTEPS);
            }
        }
    }

    render(deltaT, screen){
        var framestart = Date.now()
        if(!this.sprite){
            this.sprite = new VC.Sprite(screen, images.adventurer, 800, 600, 100, 100, 0, 0);
        }
        if(DEBUG){
            this.box.render(screen, "#FF0");
        }
        
        //render whip
        if(this.state == State.ATTACKING && this.attackBegin==null){
            if(!this.#whip.element && framestart - this.sprite.animation.startTime > 100){
                switch(this.direction){
                    case Direction.NORTH:
                        this.#whip.element = screen.drawRect(Math.round(this.#whip.box.x + this.#whip.box.width/2)-2, this.#whip.box.y, 3, this.#whip.box.height, "#624a2e","#000", 2 );
                        break;
                    case Direction.EAST:
                        this.#whip.element = screen.drawRect(this.#whip.box.x + 10,  Math.round(this.#whip.box.y + this.#whip.box.height/2)-2 +1, Math.abs(this.#whip.box.width-10), 3, "#624a2e","#000", 2);
                        this.#whip.shadow = screen.drawRect(this.#whip.box.x + 24.5, this.#whip.box.y+46.5, Math.abs(this.#whip.box.width-24), 4, "#000","#000",0).attr({"opacity":.5});
                        break;
                    case Direction.SOUTH: 
                        this.#whip.element = screen.drawRect(Math.round(this.#whip.box.x + this.#whip.box.width/2)-2, this.#whip.box.y, 3, this.#whip.box.height, "#624a2e","#000", 2);
                        break;
                    case Direction.WEST:
                        this.#whip.element = screen.drawRect(this.#whip.box.x,  Math.round(this.#whip.box.y + this.#whip.box.height/2)-2, Math.abs(this.#whip.box.width-10), 3, "#624a2e","#000", 2);
                        this.#whip.shadow = screen.drawRect(this.#whip.box.x, this.#whip.box.y+50.75, Math.abs(this.#whip.box.width-22), 4, "#000","#000",0).attr({"opacity":.5});
                        break;
                    }
            }
        } else {
            if(this.#whip.element) this.#whip.element.remove();
            this.#whip.element = null;
            if(this.#whip.shadow) this.#whip.shadow.remove();
            this.#whip.shadow = null;
        }

        //render player sprite
        if(this.state == State.DEAD){
            this.sprite.setFrame(Direction.SOUTH, State.DYING, 7);
            
            game.level.statistics.roomsVisited = filter(game.level.rooms,(r)=>{return r.visited}).length
            game.level.statistics.roomsSpawned = game.level.rooms.length
            game.statistics.add(game.level.statistics);
            game.statistics.levelNumber = game.level.number; 
            
            game.currentScene.transitionTo = new GameOverScreen(game.statistics);

        } else if (this.state == State.THROWING){
            this.sprite.setFrame(this.direction, State.THROWING, 0)
        } else {
            this.sprite.setAnimation(this.direction, this.state);
        }
        this.sprite.location.x = (this.box.x - 25) ;
        this.sprite.location.y = (this.box.y - 50) ;
        this.sprite.render(deltaT);
    }

    remove(deltaT){
        if(this.sprite){
            //this.sprite.remove();
            //this.sprite = null;
        }
        if(DEBUG){
            this.box.remove();
        } 
    }

    attack(){
        if(this.state != State.ATTACKING && this.state != State.THROWING && this.attackBegin == null){
            this.attackBegin = new Date();
        }

        if(this.tntCount>0 && this.state != State.THROWING && new Date() - this.attackBegin >= 400){
            this.state = State.THROWING;
            this.tnt = new TNT(null);
            this.tnt.box.x = this.box.center().x - this.tnt.box.width/2;
            this.tnt.box.y = this.box.center().y - this.tnt.box.height/2;
            this.tntCount--;   
        }
    }

    #whipAttack(){
        var targets = this.getObjectsInRangeOfAttack(); 
        if(this.state != State.ATTACKING && this.canAttack){
            this.state = State.ATTACKING;
            
            var url = "";
            switch(Math.round((Math.random()*2) % 3)){
                case 0:
                    url=SoundEffects.WHIP1;
                    break;
                case 1:
                    url=SoundEffects.WHIP2;
                    break;
                case 2:
                    url=SoundEffects.WHIP3;
                    break;
            }
            
            this.playSound(1, url, .9, false, false);

            var targets = this.getObjectsInRangeOfAttack(); 
            if(targets.length>0){
                var collidingWith = targets[0];
                var sb = new Starburst(this.room);
                collidingWith.hurt(this.damage, this.direction);
                if(game && game.level && game.level.statistics) {
                    game.currentScene.statistics.damageDealt += this.damage;
                }
                switch(this.direction){
                    case Direction.NORTH:
                        this.#whip.box.reset (
                            Math.round(this.box.x + this.box.width / 2 - this.#whip.thickness / 2),
                            collidingWith.box.y + collidingWith.box.height,
                            this.#whip.thickness,
                            Math.abs(this.box.y - (collidingWith.box.y + collidingWith.box.height))
                        )
                        sb.box.x = this.#whip.box.x - sb.box.width / 2;
                        sb.box.y = this.#whip.box.y - sb.box.height / 2;

                        break;
                    case Direction.EAST:
                        this.#whip.box.reset (
                            this.box.x + this.box.width,
                            Math.round(this.box.y - 25 + this.box.height/2 - this.#whip.thickness/2),
                            Math.abs(collidingWith.box.x - (this.box.x + this.box.width)),
                            this.#whip.thickness
                        )
                        sb.layer = Layer.EFFECT
                        sb.box.x = this.#whip.box.x + this.#whip.box.width  - sb.box.width / 2;
                        sb.box.y = this.#whip.box.y - sb.box.height / 2;

                        break;
                    case Direction.SOUTH:
                        this.#whip.box.reset(
                            Math.round(this.box.x + this.box.width/2 - this.#whip.thickness/2),
                            this.box.y + this.box.height,
                            this.#whip.thickness,
                            Math.abs(collidingWith.box.y - (this.box.y + this.box.height))
                        )
                        
                        sb.layer = Layer.EFFECT
                        sb.box.x = this.#whip.box.x - sb.box.width / 2;
                        sb.box.y = this.#whip.box.y + this.#whip.box.height - sb.box.height / 2;
                        break;
                    case Direction.WEST:
                        this.#whip.box.reset(
                            collidingWith.box.x + collidingWith.box.width,
                            Math.round(this.box.y - 29 + this.box.height/2 - this.#whip.thickness/2),
                            Math.abs(this.box.x - (collidingWith.box.x + collidingWith.box.width)),
                            this.#whip.thickness  
                        )
                        sb.layer = Layer.EFFECT
                        sb.box.x = this.#whip.box.x - sb.box.width / 2;
                        sb.box.y = this.#whip.box.y - sb.box.height / 2;

                        break;
                }
            }
        }
    }

    #tntAttack(){
        if(!this.tnt.state == State.WALKING){           
            this.tnt.box.x = this.box.center().x - this.tnt.box.width/2;
            this.tnt.box.y = this.box.center().y - this.tnt.box.height/2;
            switch(this.direction){
                case Direction.NORTH:
                    this.tnt.box.y = this.box.y - this.tnt.box.height;
                    break;
                case Direction.EAST:
                    this.tnt.box.x = this.box.x + this.box.width;
                    break;
                case Direction.SOUTH:
                    this.tnt.box.y = this.box.y + this.box.height;
                    break;
                case Direction.WEST:
                    this.tnt.box.x = this.box.x - this.tnt.box.width;
                    break;
            }
            this.tnt.room = this.room;
            this.tnt.direction = this.direction;
            this.tnt.state = State.WALKING;
            if (this.state==State.THROWING) {
                this.state = State.IDLE;
            }
            
        }
    }

    getObjectsInRangeOfAttack(){
        switch (this.direction){
            case Direction.NORTH: 
                this.#whip.box.reset(
                    Math.round(this.box.x + this.box.width / 2 - this.#whip.thickness / 2),
                    constrain((this.room.box.y - this.room.wallHeight / 2) ,this.box.y - this.#whip.length, this.box.y),
                    this.#whip.thickness,
                    constrain(0, this.#whip.length, this.box.y - this.room.box.y + this.room.wallHeight / 2)
                );
                break;
            case Direction.EAST:
                this.#whip.box.reset(
                    constrain(this.box.x + this.box.width,this.box.x + this.box.width,this.room.box.x+this.room.box.width + this.room.wallHeight/2),
                    Math.round(this.box.y - 25 + this.box.height/2 - this.#whip.thickness/2),
                    constrain(0, this.#whip.length, (this.room.box.x + this.room.box.width + this.room.wallHeight/2) - (this.box.x + this.box.width)),
                    this.#whip.thickness
                );
                break;
            case Direction.SOUTH:
                this.#whip.box.reset(
                    Math.round(this.box.x + this.box.width/2 - this.#whip.thickness/2),
                    constrain(this.box.y + this.box.height,this.box.y + this.box.height,this.room.box.y+this.room.box.height),
                    this.#whip.thickness,
                    constrain(0, this.#whip.length, (this.room.box.y + this.room.box.height + this.room.wallHeight/2) - (this.box.y + this.box.height))
                );
                break;
            case Direction.WEST:
                this.#whip.box.reset(
                    constrain(this.room.box.x - this.room.wallHeight/2,this.box.x - this.#whip.length, this.box.x),
                    Math.round(this.box.y - 29 + this.box.height/2 - this.#whip.thickness/2),
                    constrain(0, this.#whip.length, this.box.x - this.room.box.x + this.room.wallHeight/2),
                    this.#whip.thickness
                );
                break;
        }
          
        var distance = this.#whip.length * 2;
        var collidingWith = null;
        this.room.objects.forEach((obj)=>{
            if(obj!=this && obj.plane==Plane.PHYSICAL && obj.team == Team.getOpposingTeam(this.team)){
                var objDistance = this.box.distance(obj.box);
                if(this.#whip.box.collidesWith(obj.box) && objDistance < distance){
                    collidingWith = obj;
                    distance = objDistance;
                }
            }
        });
        if(collidingWith!=null){
            return [collidingWith];
        }
            
        return [];
    }

    hurt(damage, knockback){
        super.hurt(damage, knockback);
        if(this.health<15){
            this.playSound(2, SoundEffects.HEART, 1, true, false);
        }
        if(this.state == State.DYING){
            this.direction = Direction.SOUTH;
            this.playSound(2, SoundEffects.ADVENTURER_DEATH, 1, false, false);
        }
    }

    get health(){
        return super.health;
    }
    set health(value){
        value = constrain(0, value, super.maxHealth);
        super.health = value;
        if(this.health>10){
            this.stopSound(2, SoundEffects.HEART);
        }
    }

}
