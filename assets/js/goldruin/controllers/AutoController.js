//REQUIRES Controller

class AutoController extends Controller {

    nextRandomization = Date.now();

    constructor(){
        super()
        this.randomize();
    }

    randomize(){
        this.up = Math.round(Math.random());
        this.down = Math.round(Math.random());
        this.left = Math.round(Math.random());
        this.right = Math.round(Math.random());
        var time = Math.round(Math.random()*1000)+250;
        this.nextRandomization = Date.now() + time;
        this.nextDirection = Date.now();
    }
    
    read(forObject){
        this.attack = 0;
        var opposingTeam = Team.getOpposingTeam(forObject.team);
        forObject.getObjectsInRangeOfAttack().forEach((o)=>{
            if(o.team == opposingTeam){
                this.attack = 1; 
            }
        });

        var nvBoxScale=1.5
        var navigationBox = new VC.Box(
            forObject.box.center().x - (forObject.box.width * nvBoxScale / 2),
            forObject.box.center().y - (forObject.box.height * nvBoxScale / 2),
            forObject.box.width * nvBoxScale,
            forObject.box.height * nvBoxScale
        );

        //navigationBox.render(game.screen, "#88F");

        if (this.attack == 0){
            var directed = false;
            var target = null;
            var minDist = null;
            if(this.nextDirection<Date.now()){       
                forObject.getObjectsInView().forEach((o)=>{
                    if(o.team == opposingTeam){
                        var dist = VC.Trig.distance(forObject.box.center().x, forObject.box.center().y, o.box.center().x, o.box.center().y)
                        if(minDist!=null && dist>minDist) {
                            return;
                        }
                        minDist = dist;

                        var angle = VC.Trig.pointToAngle(o.box.center().y - forObject.box.center().y, o.box.center().x - forObject.box.center().x)

                        var deg = VC.Trig.radiansToDegrees(angle);
                        console.log(deg);
                        if (deg>=22.5 && deg<67.5){
                            this.right = 1;
                            this.down = 1;
                            this.left = 0;
                            this.up = 0;
                        }else if (deg>=67.5 && deg<112.5){
                            this.right = 0;
                            this.down = 1;
                            this.left = 0;
                            this.up = 0;
                        }else if (deg>=112.5 && deg<157.5){
                            this.right = 0;
                            this.down = 1;
                            this.left = 1;
                            this.up = 0;
                        } else if (deg>=157.5 && deg<202.5){
                            this.right = 0;
                            this.down = 0;
                            this.left = 1;
                            this.up = 0;
                        } else if (deg>=202.5 && deg<247.5){
                            this.right = 0;
                            this.down = 0;
                            this.left = 1;
                            this.up = 1;
                        } else if (deg>=247.5 && deg<292.5){
                            this.right = 0;
                            this.down = 0;
                            this.left = 0;
                            this.up = 1;
                        } else if (deg>=292.5 && deg<337.5){
                            this.right = 1;
                            this.down = 0;
                            this.left = 0;
                            this.up = 1;
                        } else {
                            this.right = 1;
                            this.down = 0;
                            this.left = 0;
                            this.up = 0;  
                        }


                        directed = true;
                        target = o.box.center();
                    }
                
                });
            }
            if(directed){
                this.nextDirection = Date.now() + 375;
                forObject.getObjectsInView().forEach((o)=>{
                    if(o.team == Team.UNALIGNED && o.plane == Plane.PHYSICAL){
                        if(navigationBox.collidesWith(o.box)){
                            //navigationBox.render(game.screen, "#F00");
                            //course correction
                            if(this.up && o.box.center().y < navigationBox.center().y){
                                if(target.x<o.box.center().x){
                                    this.left = 1;
                                } else {
                                    this.right = 1;
                                }
                                this.up = 0;
                            } else if (this.down && o.box.center().y > navigationBox.center().y){
                                if(target.x<o.box.center().x){
                                    this.left = 1;
                                } else {
                                    this.right = 1;
                                }
                                this.down = 0;
                            } else if(this.left && o.box.center().x < navigationBox.center().x){
                                if(target.y<o.box.center().y){
                                    this.up = 1;
                                } else {
                                    this.down = 1;
                                }
                                this.left = 0;
                            } else if(this.right && o.box.center().x > navigationBox.center().x){
                                if(target.y<o.box.center().y){
                                    this.up = 1;
                                } else {
                                    this.down = 1;
                                }
                                this.right = 0;
                            }
                        }
                    }

                });
            }

            if(!directed && this.nextDirection<Date.now()){
                if(this.nextRandomization<Date.now()){
                    this.randomize();
                }    
            }
        }

        return {
            x: this.left * -1 + this.right,
            y: this.up * -1  + this.down,
            a: this.attack
        }
    }
}
