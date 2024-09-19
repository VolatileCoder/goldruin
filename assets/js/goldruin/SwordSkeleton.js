//REQUIRES Character, Starburst, State, Team, Direction

class SwordSkeleton extends Character{
    constructor(controller){
        super(controller);
        this.box.x = Math.round(dimensions.width / 2)-100;
        this.box.y = Math.round(dimensions.width / 2)-100;
        this.box.height = 66;
        this.box.width = 50;
        this.team = Team.DUNGEON;
        this.direction = Direction.EAST;
        this.controller = controller;
        this.speed = 25;
        this.health = 30;
        this.maxHealth = 30;
        this.damage = 10;
        this._attackDuration = 500;
        this._attackCooldown = 1500;
    }
    move(deltaT){
        if(!this.sprite || this.sprite.animation.frame>4){
            this.speed = 60;
        } else {
            this.speed = 4;
        }

        if(this.sprite && this.state == State.ATTACKING && !this.attacked && this.sprite.animation.frame==3){
            this.attacked==true;
            var opposingTeam = Team.getOpposingTeam(this.team)
            var targets = this.getObjectsInRangeOfAttack();
            targets.forEach((o)=>{
                if(o.team == opposingTeam){
                    var rect = this._attackBox.intersectRect(o.box)
                    if(rect){
                        o.hurt(this.damage, this.direction);
                        var sb = new Starburst()
                        sb.box = rect
                        game.currentRoom.objects.push(sb);
                    }
                }
            }); 
        }

        var state1 = this.state;
        super.move(deltaT); 
        if(this.state != state1){
            switch(this.state){
                case State.WALKING: 
                    sfx.skeletonwalk(this, true);
                    break;
                default:
                    sfx.skeletonwalk(this,false)
            }
        }
    }

    render(deltaT){
        if(!this.sprite){
            this.sprite = new VC.Sprite(game.screen, images.swordSkeleton, 1200, 750, 150, 150, this.box.x-50, this.box.y-59);
            this.sprite.lastLocation.x = this.box.x-50;
            this.sprite.lastLocation.y = this.box.y-59;    
        }
        if(game.debug){ 
           this.box.render(game.screen, "#FFF");
        } 
        this.sprite.setAnimation(this.direction, this.state);
        this.sprite.render(deltaT);
        //if (this.sprite.animation.frame!==2&&this.sprite.animation.frame!==6){
            this.sprite.location.x = this.box.x-50;
            this.sprite.location.y = this.box.y-59;    
        //}
    }
    remove(){
        if(this.sprite){
            this.sprite.remove();
        }
        if(this.attackPlayer){
            this.attackPlayer.stop();
            this.attackPlayer.dispose();
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
            sfx.skeletonattack(this);
            this.state = State.ATTACKING;
            this.attacked==false;
        }
    }

    getObjectsInView(){
        //initialize the view box
        if(!this._viewBox){
            this._viewBox = new VC.Box(0,0,50,50);
            this._viewBox.height = game.currentRoom.box.height;
            this._viewBox.width = game.currentRoom.box.width;
            this._viewBox.x = game.currentRoom.box.x;
            this._viewBox.y = game.currentRoom.box.y;
        }
        //reposition the view box
   
        
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
            this._attackBox = new VC.Box(0,0,50,50);
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
        var startHealth=this.health;
        super.hurt(damage,knockback);
        if(startHealth>0 && this.health<=0){
            game.level.statistics.swordSkeletonsKilled++;
            game.level.statistics.enemiesKilled++;
            sfx.skeletonDeath();
        }
    }
}
