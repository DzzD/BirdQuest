/*
 * Import TIGL, Random and Tween
 */
const Tigl = require("tiglmanager");
const Random = require("random");
const Tween = require("tween.cjs");

class GameLevel
{

    constructor(tiglView, options)
    {
        if(!options)
        {
            options = {};
        }

        this.tiglView = tiglView;
        this.tigl = new Tigl(tiglView);

        this.gameStage;                  //Current game stage
        this.gameStageStartTime = 0;     //Current game stage start time
        this.frameTime = 0;              //Current frame time (ms)
        this.lastFrameTime = 0;          //Last frame time (ms)
        this.width = 0;                  //View width
        this.height = 0;                 //View height
        this.ground = null;              //Ground sprite
        this.ready = null;               //Ready! sprite
        this.gameover = null;            //Gameover sprite
        this.bird = null;                //Bird sprite

        this.gravity = 1750;             //Gravity
        this.groundHeight = 128;         //Ground height
        this.worldSpeed = 0.2;           //World speed units/ms => 200 units/second
        this.treeHoleSize = options.treeHoleSize ? options.treeHoleSize : 300;
        this.minimunTreeTimeSpace = options.minimunTreeTimeSpace ? options.minimunTreeTimeSpace : 3000;

        this.pipesUp = new Array();      //Pipes pointing up sprites
        this.pipesDown = new Array();    //Pipes pointing down sprites
        this.miscs = new Array();        //Miscellaneous objects
        this.lastPipeCreateTime = 0;     //Last time game try of creating pipes


        this.random = new Random(0);     //Pseudo random number generator

        var self = this;
        this.tiglView.addEventListener("init", function(){self.init()});
        this.tiglView.addEventListener("resize", function(e){self.resize(e)});
        this.tiglView.addEventListener("loop", function(){self.loop()});
        this.tiglView.addEventListener("touch", function(e){self.touch(e)});
        
    }

    init()
    {
        this.textA = this.tigl.addText({font : "Resources/KidGame.fnt", text: "WOW!", x: 50, y: 225, r: -20, fontSize: 64, color: "green", outlineColor: "white"});
        this.textA.text = "SUPER";
        this.textA.color = 0xFFFF0000;
        this.textA.outlineColor = 0xFFFFFFFF;

        this.textB = this.tigl.addText({font : "Resources/KidGame.fnt", text: "WOW!", x: 150, y: 450, r: 20, fontSize: 64, color: "green", outlineColor: "white"});
        this.textB.text = "YOUPI !";
        this.textB.color = 0xFF00FF00;
        this.textB.outlineColor = 0xFFFFFFFF;
        
        /*
        * Load Sky
        */
       this.tigl.addSprite({url: "Resources/sky.png", width: 2000, height: 2000, tile: true, layer: 0});
    
        /*
        * Load Ground
        */
       this.ground = this.tigl.addSprite({url: "Resources/ground.png", width: 256*50, height: 256, tile: true, layer: 5});
        
        /*
        * Load Bird animation
        */
       this.bird = this.tigl.addSprite({url: "Resources/bird.png", width: 128, height: 128, px: 66, py: 70, x: 100, y: 100, layer: 1});
        
        /*
        * Load gameover
        */
       this.gameover = this.tigl.addSprite({url: "Resources/gameover.png", width: 518, height: 164, px: 259, py: 82, y: -500,layer: 10});

        /*
        * Load ready
        */
        this.ready = this.tigl.addSprite({url: "Resources/ready.png", width: 500, height: 150, px: 250, py: 75, y: -500, layer: 10});

       this.waitResizeToStart();

    }

    
    /* 
    * If view has been resized, start the game
    *  if not wait 100ms and retry
    */
    waitResizeToStart()
    {
        if(this.width && this.height)
        {
            this.setGameStage("starting");
            return;
        }
        var self = this;
        setTimeout(function(){self.waitResizeToStart()}, 100);
    }

    resize(e)
    {

        var width = parseInt(e.width);
        var height = parseInt(e.height);
        var ratio =  height / 1000.0;
        this.width = width / ratio;
        this.height = height / ratio;
        this.tigl.setSceneScale(ratio, ratio);
        this.ground.y = this.height - this.groundHeight;
    }

    
    /*
    * Change game stage
    * Here set actions required when game stage is changing 
    */
    setGameStage(newGameStage)
    {
        switch(newGameStage)
        {
            /* 
            * Action if current game stage become "starting"
            */
            case "starting":
                if(this.gameStage == "gameover")
                {
                    this.gameover.x = this.width/2;
                    this.gameover.y = -90;

                    for(var n = 0; n < this.pipesUp.length; n++)
                    {
                        this.pipesUp[n].remove();
                    }
                    this.pipesUp = new Array();
                    
                    for(var n = 0; n < this.pipesDown.length; n++)
                    {
                        this.pipesDown[n].remove();
                    }
                    this.pipesDown = new Array();

                    
                    for(var n = 0; n < this.miscs.length; n++)
                    {
                        this.miscs[n].remove();
                    }
                    this.miscs = new Array();
                }

                this.ready.x = this.width/2;
                this.ready.y = (this.height - this.groundHeight) / 2;
                new Tween.Tween(this.ready)
                .to({y: -90}, 1000)
                .easing(Tween.Easing.Elastic.In).delay(1500).start();

                this.bird.playAnimation({loop: 0, pingpong: true, duration: 300});
                this.random = new Random(1);
            break;

            /* 
            * Action if current game stage become "gameover"
            */
            case "gameover":
                this.bird.playAnimation({loop: 1, duration: 0});
                new Tween.Tween(this.bird)
                            .to({y: this.bird.y - 200}, 500)
                            .easing(Tween.Easing.Quadratic.Out).chain(new Tween.Tween(this.bird)
                            .to({y: this.ground.y}, 500)
                            .easing(Tween.Easing.Quadratic.In)).start();

                this.gameover.x = this.width/2;
                this.gameover.y = -90;
                new Tween.Tween(this.gameover)
                        .to({x: this.width/2, y: (this.height - this.groundHeight)/2}, 1000)
                        .easing(Tween.Easing.Elastic.Out).delay(1000).start();
            break;
        }
        this.gameStage = newGameStage;
        this.gameStageStartTime = Date.now();
    }

    
    /*
    * Loop must be declared as an attribute of the Alloy tag TIGLView (eg: onLoop="loop")
    * This is called for each frame
    * Here set actions depending on current game stage
    */ 
    loop()
    {
        this.frameTime = Date.now();
        switch(this.gameStage)
        {
            
            /*
            * Actions, if current game stage is "starting"
            */
            case "starting" :
                this.updateWorld();
                this.bird.y = (this.height - this.groundHeight) * 0.5;
                this.bird.vy = 0;
                this.bird.r = 0;
                if(this.gameStageDuration() > 3000)
                {
                    this.setGameStage("running");
                }
            break;

            /*
            * Actions, if current game stage is "running"
            */
            case "running" :
                this.updateWorld();
                this.updateBird();
                this.updatePipes();
                this.performCollisions();
            break;

        }
        this.lastFrameTime = this.frameTime;
        Tween.update(); //Requiered for tweens to be updated 
    }


    /*
    * Bird updating when the game is running
    */
    updateBird()
    {   
        if(this.bird.flying)
        {
            this.bird.vy = -500;
        }              
        this.bird.vy += this.gravity * this.frameDuration();        //Move bird up or down depending on vertical speed
        this.bird.vy *= 0.99;                                       //Some friction
        this.bird.targetRotate = 45 * this.bird.vy / 1000;          //Rotate bird dependingon vertical speed
        this.bird.r += (this.bird.targetRotate - this.bird.r) * 0.7;
        this.bird.y += this.bird.vy * this.frameDuration();         //Move bird up or down
    }

    /*
    * World updating  when the game is running
    */
    updateWorld()
    {
        /* 
        * Move ground
        */
        this.ground.x = - (Date.now() * this.worldSpeed) % 595;
        this.ground.y = this.height - this.groundHeight;
        
        /*
        * Move pipes upward
        */
        for(var n = 0; n < this.pipesUp.length; n++)
        {
            var pipe = this.pipesUp[n];
            pipe.x = pipe.startX - (Date.now()- pipe.startTime) * this.worldSpeed;
        }
        
        /*
        * Move pipes downard
        */
        for(var n = 0; n < this.pipesDown.length; n++)
        {
            var pipe = this.pipesDown[n];
            pipe.x = pipe.startX - (Date.now()- pipe.startTime) * this.worldSpeed;
        }

        
        /*
        * Move miscs objects
        */
        for(var n = 0; n < this.miscs.length; n++)
        {
            var misc = this.miscs[n];
            misc.x = misc.startX - (Date.now()- misc.startTime) * this.worldSpeed;
        }
    }

    /*
    * Pipes updating  when the game is running
    */
    updatePipes()
    {
        /*
        * If last update was less than 2s ago, do nothing
        */
        if((Date.now() - this.lastPipeCreateTime) > this.minimunTreeTimeSpace)
        {
            /*
                * Compute random height for tube
                * @todo: use a pseudo random number generator to always get same level
                */
                var topPostion = this.random.nextFloat() * (this.height - this.groundHeight - this.treeHoleSize) + this.treeHoleSize;
                
                /* 
                * Get a random value that determine if we create a pipe upward, downward or both
                * @todo: use a pseudo random number generator to always get same level
                */
                var rand = Math.floor(this.random.nextFloat() * 7);

                /*
                * Create a pipe upward randomly
                */
                if(rand == 1 || rand == 2 || rand == 3 || rand == 4 || rand == 5)
                {
                   
                    var pipe = this.tigl.addSprite({url: "Resources/pipeUp.png", width: 125, x: this.width + 100, y: topPostion, px: 62});
                    pipe.startX = pipe.x;
                    pipe.startTime = Date.now();
                    this.pipesUp.push(pipe);

                    var grass = this.tigl.addSprite({url: "Resources/grass.png", x: this.width + 100, y: this.height - this.groundHeight, px: 75, py: 37, layer: 6});
                    grass.startX = grass.x;
                    grass.startTime = Date.now();
                    this.miscs.push(grass);
                }
                
                /*
                * Create a pipe downard randomly
                */
                if(rand == 2 || rand == 3 || rand == 4 || rand == 5 || rand == 6)
                {
                    var pipe = this.tigl.addSprite({url: "Resources/pipeDown.png", width: 125, x: this.width + 100, y: topPostion - this.treeHoleSize, px: 62, sy: -1});
                    pipe.startX = pipe.x;
                    pipe.startTime = Date.now();
                    this.pipesDown.push(pipe);
                }

                if(rand != 1)
                {
                    var flours = this.tigl.addSprite({url: "Resources/flours.png", x: this.width + 300,y: this.height - this.groundHeight, px: 110, py: 150, layer: 7});
                    flours.startX = flours.x;
                    flours.startTime = Date.now();
                    this.miscs.push(flours);

                }
                this.lastPipeCreateTime = Date.now();
        }

    }

    /*
    * Test for bird collisions on ground or pipes
    */
    performCollisions()
    {
        /*
        * Collision on ground ?
        */
        if(this.bird.y > this.ground.y - 20)
        {
            this.setGameStage("gameover");
        }

        /*
        * Collision on pipes upward ?
        */
        for(var n = 0; n < this.pipesUp.length; n++)
        {
            var pipe = this.pipesUp[n];
            if(this.bird.x > pipe.x - 82 && this.bird.x<pipe.x + 82 && this.bird.y > pipe.y - 20)
            {
                this.setGameStage("gameover");
            }
        }

        /*
        * Collision on pipes downward ?
        */
        for(var n = 0; n < this.pipesDown.length; n++)
        {
            var pipe = this.pipesDown[n];
            if(this.bird.x > pipe.x - 82 && this.bird.x<pipe.x + 82 && this.bird.y < pipe.y + 20)
            {
                this.setGameStage("gameover");
            }

        }
    }


    /*
    * Return the current frame duration in second
    */
    frameDuration()
    {
        if(this.lastFrameTime == 0)
        {
            return 0;
        }
        return (this.frameTime - this.lastFrameTime) * 0.001;
    }

    /*
    * Return the current game stage duration in ms
    */
    gameStageDuration()
    {
        return Date.now() - this.gameStageStartTime;
    }


    /*
    * Touch must be declared as an attribute of the Alloy tag TIGLView (eg: onTouch="touch")
    * Manage touch events
    */ 
    touch(e)
    {
        switch(e.action)
        {
            case "down" :
                    if(this.gameStage == "running")
                    {
                        // this.bird.vy = -500;
                        this.bird.flying = true;
                    }
                break;

                case "up" :
                    if(this.gameStage == "gameover" && this.gameStageDuration() > 2000)
                    {
                        this.setGameStage("starting");
                    }

                    if(this.gameStage == "running")
                    {
                        // this.bird.vy = -500;
                        this.bird.flying = false;
                    }
                break;
        }

    }



}

module.exports = GameLevel;