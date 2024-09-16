class Sprite{
    #screen = null;
    #image = {
        frameset: null, 
        width: 0,
        height: 0
    };
    #size = {
        width: 0,
        height: 0
    };
    #location = {
        x: 0,
        y: 0, 
        r: 0
    };
    #lastLocation = {
        x: 0,
        y: 0, 
        r: 0
    };
    #scale = 1;
    #animation = {
        index: 0,
        series: 0,
        frame: 0,
        startTime: Date.now()
    };
    #lastAnimation = {
        index: -1,
        series: -1,
        frame: -1
    };
    #opacity = 1;
    #ready = 1;
    #element = null;
    #lastIndex = -1;

    get opacity(){
        return this.#opacity
    }

    set opacity(value){
        this.#opacity = value;
    }
    
    get animation(){
        return this.#animation;
    }

    get location(){
        return this.#location;
    }
    
    get lastLocation(){
        return this.#lastLocation;
    }

    get size(){
        return this.#size;
    }

    constructor(screen, frameset, imageWidth, imageHeight, spriteWidth, spriteHeight, x, y){
        this.#screen = screen;
        this.#image.frameset = frameset;
        this.#image.width = imageWidth;
        this.#image.height = imageHeight;
        this.#size.width = spriteWidth;
        this.#size.height = spriteHeight;
        this.#location.x = x;
        this.#location.y = y;
        this.#lastLocation.x = x;
        this.#lastLocation.y = y;
    }

    setAnimation(index,series){
        if (index!=this.#animation.index||series!=this.#animation.series){
            this.#animation.index = index;
            this.#animation.series = series;
            this.#animation.frame = 0;
            this.#animation.startTime = Date.now();
        }
    }
    setFrame (index, series, frame){
            this.#animation.index = index;
            this.#animation.series = series;
            this.#animation.frame = frame;
            this.#animation.startTime = 0;
    }
    render(deltaT){
        var forceRender = false;
        this.#animation.frame = this.#calculateCurrentFrame(deltaT);
        if(this.#animation.startTime==0)
        {
            forceRender = true
        }
        var trans0 = this.#buildTranslation(this.#lastLocation.x, this.#lastLocation.y, this.#lastLocation.r);
        var trans1 = this.#buildTranslation(this.#location.x, this.#location.y, this.#location.r);

        var rect = this.#buildClipRect(); 

        if(!this.#element){
            this.#element = this.#screen.image(this.#image.frameset[this.#animation.index], 0, 0, this.#image.width, this.#image.height).attr({opacity:0, "clip-rect": rect, transform:trans1});
            trans0 = trans1;
            this.#lastLocation.x = this.#location.x;
            this.#lastLocation.y = this.#location.y;
            this.#lastLocation.r = this.#location.r;
            this.#screen.onClear(()=>{this.#element = null});
            this.#ready = 1  
            this.#lastIndex = this.#animation.index;
            forceRender = true
        } 
        if(this.#lastIndex != this.#animation.index){
            this.#element.attr("src",this.#image.frameset[this.#animation.index]);
            this.#lastIndex = this.#animation.index;
        }

        var frameChanged = (this.#lastAnimation.frame != this.#animation.frame || this.#lastAnimation.index != this.#animation.index || this.#lastAnimation.series != this.#animation.series)
        var positionChanged = (this.#location.x!=this.#lastLocation.x || this.#location.y != this.#lastLocation.y || this.#location.r != this.#lastLocation.r);

        if ((frameChanged || positionChanged || forceRender) && this.#element && this.#ready==1){
            this.#ready = 0;
            this.#element.attr({opacity:this.#opacity}).animate({transform:trans0, "clip-rect": rect},0, 'linear',()=>{
                if (this.#element){
                    this.#element.animate({transform:trans1, "clip-rect": rect}, deltaT, 'linear',()=>{
                        this.#ready = 1
                    });
                }
            });
        }

        this.#lastAnimation.frame = this.#animation.frame;
        this.#lastAnimation.index = this.#animation.index;
        this.#lastAnimation.series = this.#animation.series;
        this.#lastLocation.x = this.#location.x;
        this.#lastLocation.y = this.#location.y;
        this.#lastLocation.r = this.#location.r;
        this.#element.toFront();
        return this.#element;
    }
    
    remove (){
        if (this.#element){
            this.#element.remove();
        }
    }

    #buildTranslation (x, y, r){
        var tx = Math.round(x * (1/this.#scale) - this.#animation.frame * this.#size.width);
        var ty = Math.round(y * (1/this.#scale) - this.#animation.series *  this.#size.height) + dimensions.infoHeight;
        var t = "t" + tx + "," + ty 
        if(this.#scale!=1){
            t="s"+this.#scale +","+this.#scale+",0,0" + t;
        }
        if(r == 0){
            return t
        }
        var rx = Math.round(this.#animation.frame * this.#size.width + this.#size.width/2);
        var ry = Math.round(this.#animation.series *  this.#size.height + this.#size.height/2);
        return t + "r" + r + "," + rx + "," + ry;
    }
    #buildClipRect(){
        var x = Math.round(this.#animation.frame * this.#size.width)+1
        var y = Math.round(this.#animation.series * this.#size.height)+1
        var w = this.#size.width-2;
        var h = this.#size.height-2;
        return "" + x + "," + y +"," + w + "," + h;
    }
    #calculateCurrentFrame(deltaT) {
        if (this.#animation.startTime == 0){
            return this.#animation.frame;
        }
        var animdelta = Date.now() - this.#animation.startTime;
        var frame = Math.round((animdelta / 1000) * constants.spriteFamesPerSecond) % Math.round(this.#image.width/this.#size.width);
        return frame;
    }
}
