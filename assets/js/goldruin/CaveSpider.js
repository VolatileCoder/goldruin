//REQUIRES Character, Team, Direction, State

class CaveSpider extends Character {
    constructor(controller){
        super(controller);
        this.box.x = Math.round(dimensions.width / 2)-100;
        this.box.y = Math.round(dimensions.width / 2)-100;
        this.box.height = 75;
        this.box.width = 75;
        this.team = Team.DUNGEON;
        this.direction = Direction.EAST;
        this.speed = 110;
        this.health = 20;
        this.maxHealth = 20;
        this.damage = 5;
        this._attackDuration = 500;
        this._attackCooldown = 2000;
    }
    move(deltaT){
        
        if(!this.canAttack && this.state!=State.DYING && this.state!=State.DEAD) {
            if(this.state == State.HURT){
                if(Date.now()-this._stateStart < this._hurtDuration){
                    return
                }
                this.state = State.IDLE;
            }
            return;
        }
        var state1 = this.state;
        super.move(deltaT);
        if(this.state!=state1){
            switch(this.state){
                case State.WALKING: 
                    sfx.spiderwalk(this, true);
                    break;
                default:
                    sfx.spiderwalk(this,false)
            }
        }
        switch(this.direction){
            case Direction.NORTH:
                this.box.width = 75;
                this.box.height = 50;
                break;
            case Direction.WEST:
                this.box.width = 75;
                this.box.height = 50;
                break;
            case Direction.SOUTH:
                this.box.width = 75;
                this.box.height = 60;
                break;
            case Direction.EAST:
                this.box.width = 75;
                this.box.height = 50;
                break;      
        }
    }

    render(deltaT){
        if(!this.sprite){
            this.sprite = new VC.Sprite(game.screen, images.caveSpider, 800, 500, 100, 100, 0, 0);
        }
        if(game.debug){
           this.box.render(game.screen, "#FFF");
        } 
  
        this.sprite.location.x = this.box.x-15;
        this.sprite.location.y = this.box.y-(this.direction== Direction.SOUTH ? 20 : 40);
        this.sprite.setAnimation(this.direction, this.state);
        if (this.state == State.ATTACKING && this.sprite.animation.frame==7){
            this.state = State.IDLE
        }
        this.sprite.render(deltaT);
    }

    remove(){
        if(this.sprite){
            this.sprite.remove();
        }
        if(this.bitePlayer){
            this.bitePlayer.stop();
            this.bitePlayer.dispose();
        }
        if(this.walkPlayer){
            this.walkPlayer.stop();
            this.walkPlayer.dispose();
        } 
        if(game.debug){
            this.box.remove();
        }
    }

    attack(){
        if(this.state != State.ATTACKING){
            sfx.spiderbite(this);
            this.state = State.ATTACKING;
        }
        var opposingTeam = Team.getOpposingTeam(this.team)
        var targets = this.getObjectsInRangeOfAttack();
        targets.forEach((o)=>{
            if(o.team == opposingTeam){
                var rect = this._attackBox.intersectRect(o.box)
                if(rect){
                    o.hurt(this.damage);
                    var sb=new Starburst()
                    sb.box = rect;
                    game.currentRoom.objects.push(sb);
                }
            }
        });
    }

    getObjectsInView(){
        //initialize the view box
        if(!this._viewBox){
            this._viewBox = new VC.Box(0,0,50,50);
        }
        //reposition the view box
        switch(this.direction){
            case Direction.NORTH:
                this._viewBox.height = 500;
                this._viewBox.width = 200;
                this._viewBox.x = this.box.center().x - this._viewBox.width/2;
                this._viewBox.y = this.box.y + this.box.height - this._viewBox.height
                break;
            case Direction.EAST:    
                this._viewBox.width = 500;
                this._viewBox.height = 200;
                this._viewBox.x = this.box.x;
                this._viewBox.y = this.box.center().y - this._viewBox.height/2
                break;
            case Direction.SOUTH:
                this._viewBox.height = 500;
                this._viewBox.width = 200;
                this._viewBox.x = this.box.center().x - this._viewBox.width/2;
                this._viewBox.y = this.box.y 
                break;
            case Direction.WEST:
                this._viewBox.width = 500;
                this._viewBox.height = 200;
                this._viewBox.x = this.box.x + this.box.width - this._viewBox.width;
                this._viewBox.y = this.box.center().y - this._viewBox.height/2
                break;
        }
        if (game.debug){
            this._viewBox.render(game.screen, "#FF0");
        }
        var inView = [];
        game.currentRoom.objects.forEach((o)=>{
            if(o.box.collidesWith(this._viewBox)){
                inView.push(o);
            }
        })

        return inView;
    }
    getObjectsInRangeOfAttack(){
        //initialize the attack box
        if(!this._attackBox){
            this._attackBox = new VC.Box(0,0,25,25);
        }
        //reposition the attack box
        switch(this.direction){
            case Direction.NORTH:
                this._attackBox.x = this.box.center().x - Math.round(this._attackBox.width / 2);
                this._attackBox.y = this.box.y - this._attackBox.height
                break;
            case Direction.EAST:
                this._attackBox.x = this.box.x + this.box.width;
                this._attackBox.y = this.box.center().y - Math.round(this._attackBox.height/2);
                break;
            case Direction.SOUTH:
                this._attackBox.x = this.box.center().x - Math.round(this._attackBox.width / 2);
                this._attackBox.y = this.box.y + this.box.height;
                break;
            case Direction.WEST:
                this._attackBox.x = this.box.x - this._attackBox.width;
                this._attackBox.y = this.box.center().y - Math.round(this._attackBox.height/2);   
                break;
        }
        if (game.debug){
            this._attackBox.render(game.screen, "#800");
        }
        var inRange = []
        game.currentRoom.objects.forEach((o)=>{
            if(o!=this && this._attackBox.collidesWith(o.box)){
                inRange.push(o);
            }
        });
        return inRange;
    }
   
    hurt(damage, knockback){
        var startHealth = this.health;
        super.hurt(damage, knockback);
        if(startHealth > 0 && this.health <= 0){
            game.level.statistics.caveSpidersKilled++;
            game.level.statistics.enemiesKilled++;
            sfx.spiderDeath();
        }
    }
}