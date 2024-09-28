//REQUIRES Character, Team, Direction, State, Images, SoundEffects

class Snake extends Character {
    sprite = null;
    constructor(room, controller){
        super(room, controller);
        this.box.x = Math.round(dimensions.width / 2)-100;
        this.box.y = Math.round(dimensions.width / 2)-100;
        this.box.height = 50;
        this.box.width = 50;
        this.team = Team.DUNGEON;
        this.direction = Direction.EAST;
        this.speed = 85;
        this.health = 20;
        this.maxHealth = 20;
        this.damage = 5;
        this._attackDuration = 500;
        this._attackCooldown = 1500;
    }

    move(deltaT){
        super.move(deltaT);
        
    };
    render(deltaT, screen){
        if(!this.sprite){
            this.sprite = new VC.Sprite(screen, Images.KING_COBRA, 800, 500, 100, 100, 0, 0);
        }
        if(DEBUG){
           this.box.render(screen, "#FFF");
        } 
        
        switch(this.direction){
            case Direction.NORTH:
                this.box.width = 50;
                this.sprite.location.x = this.box.x-25;
                this.sprite.location.y = this.box.y-25;
                break;
            case Direction.WEST:
                this.box.width = 75;
                this.sprite.location.x = this.box.x-10;
                this.sprite.location.y = this.box.y-30;
                break;
            case Direction.SOUTH:
                this.box.width = 50;
                this.sprite.location.x = this.box.x-25;
                this.sprite.location.y = this.box.y-10;
                break;
            case Direction.EAST:
                this.box.width = 75;
                this.sprite.location.x = this.box.x-15;
                this.sprite.location.y = this.box.y-30;
                break;
                        
        }

        this.sprite.setAnimation(this.direction, this.state);
        this.sprite.render(deltaT);
    }
    remove() {
        if(this.sprite){
            this.sprite.remove();
        }
        if(this.bitePlayer){
            this.bitePlayer.stop();
            this.bitePlayer.dispose();
        }
       
        if(DEBUG){
            this.box.remove();
        }
        super.remove();
    }
    attack(){
        if(this.state != State.ATTACKING){
            this.playSound(0, SoundEffects.SNAKE_BITE, 1, false, false);
            this.state = State.ATTACKING;
        }
        var opposingTeam = Team.getOpposingTeam(this.team)
        var targets = this.getObjectsInRangeOfAttack();
        targets.forEach((o)=>{
            if(o.team == opposingTeam){
                var rect = this._attackBox.intersectRect(o.box)
                if(rect){
                    o.hurt(this.damage);
                    var sb = new Starburst(this.room);
                    sb.box = rect;
                }
            }
        });
    }
    getObjectsInView(){
        //initialize the view box
        if(!this._viewBox){
            this._viewBox = new VC.Box(0,0,50,50);
        }

        this._viewBox.height = 500;
        this._viewBox.width = 500;
        this._viewBox.x = this.box.center().x - this._viewBox.width/2;
        this._viewBox.y = this.box.center().y - this._viewBox.height/2;

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
        super.hurt(damage, knockback);
        if(startHealth>0 && this.health<=0){
            if (game && game.level && game.level.statistics){
                game.level.statistics.snakesKilled++;
                game.level.statistics.enemiesKilled++;
            }
            this.playSound(0, SoundEffects.SNAKE_DEATH, 1, false, false);
        }
    }
}