//REQUIRES Character, Starburst, State, Team, Direction

class SwordSkeleton extends Character{
    constructor(room, controller){
        super(room, controller);
        this.box.x = Math.round(dimensions.width / 2)-100;
        this.box.y = Math.round(dimensions.width / 2)-100;
        this.box.height = 66;
        this.box.width = 50;
        this.team = Team.DUNGEON;
        this.direction = Direction.EAST;
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
                        var sb = new Starburst(this.room)
                        sb.box = rect
                    }
                }
            }); 
        }

        var state1 = this.state;
        super.move(deltaT); 
        if(this.state != state1){
            switch(this.state){
                case State.WALKING: 
                    this.playSound(0, SoundEffects.SWORDSKELETON_WALK, .2, true, false);
                    break;
                default:
                    this.stopSound(0, SoundEffects.SWORDSKELETON_WALK);
            }
        }
        
    }

    render(deltaT, screen){
        if(!this.sprite){
            this.sprite = new VC.Sprite(screen, images.swordSkeleton, 1200, 750, 150, 150, this.box.x-50, this.box.y-59);
            this.sprite.lastLocation.x = this.box.x-50;
            this.sprite.lastLocation.y = this.box.y-59;    
        }
        if(DEBUG){ 
           this.box.render(screen, "#FFF");
        } 
        this.sprite.setAnimation(this.direction, this.state);
        this.sprite.render(deltaT);
        //if (this.sprite.animation.frame!==2&&this.sprite.animation.frame!==6){
            this.sprite.location.x = this.box.x-50;
            this.sprite.location.y = this.box.y-59;    
        //}
    }
    remove(){
        if (this.room == game.level.currentRoom){
            console.log("removing skeleton...", Date.now())
        
        }
        super.remove();
        if(this.sprite){
            this.sprite.remove();
        }
        if(DEBUG){
            this.box.remove();
        }
    }

    attack(){
        if(this.state != State.ATTACKING){
            this.playSound(1, SoundEffects.SWORDSKELETON_ATTACK, 1, false, false);
            this.state = State.ATTACKING;
            this.attacked==false;
        }
    }

    getObjectsInView(){
        //initialize the view box
        if(!this._viewBox){
            this._viewBox = new VC.Box(0,0,50,50);
            this._viewBox.height = this.room.box.height;
            this._viewBox.width = this.room.box.width;
            this._viewBox.x = this.room.box.x;
            this._viewBox.y = this.room.box.y;
        }
        //reposition the view box
   
        
        var inView = [];
        this.room.objects.forEach((o)=>{
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
        
        var inRange = []
        this.room.objects.forEach((o)=>{
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
            this.playSound(2, SoundEffects.SKELETON_DEATH, 1, false, false);
        }
    }
}
