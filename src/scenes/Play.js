class Play extends Phaser.Scene {
    constructor() {
        super("playScene");
    }

    preload() {
        // load images/tile sprites
        this.load.image('frog', './assets/frog.png');
        this.load.image('fly', './assets/fly.png');
        this.load.image('background', './assets/background.png');
        // load spritesheet
        this.load.spritesheet('eating', './assets/eating.png', 
        {frameWidth: 64, frameHeight: 32, startFrame: 0, endFrame: 9});
    }

    create() {
        //place tile sprite
        this.background = this.add.tileSprite(0,0,640,480, 'background').setOrigin(0,0);
        // green UI background
        //this.add.rectangle(0, borderUISize + borderPadding, game.config.width, borderUISize * 2, 0x00FF00).setOrigin(0, 0);
        // white borders
        // this.add.rectangle(0, 0, game.config.width, borderUISize, 0xFFFFFF).setOrigin(0, 0);
        // this.add.rectangle(0, game.config.height - borderUISize, game.config.width, borderUISize, 0xFFFFFF).setOrigin(0, 0);
        // this.add.rectangle(0, 0, borderUISize, game.config.height, 0xFFFFFF).setOrigin(0, 0);
        // this.add.rectangle(game.config.width - borderUISize, 0, borderUISize, game.config.height, 0xFFFFFF).setOrigin(0, 0);
        //add frog(p1)
        this.p1frog = new frog(this, game.config.width/2, game.config.height-borderUISize-borderPadding, 'frog').setOrigin(0.5,0);
        //add 3 flys
        this.fly01 = new fly(this, game.config.width + borderUISize*6, borderUISize*4, 'fly', 0, 30).setOrigin(0,0);
        this.fly02 = new fly(this, game.config.width + borderUISize*3, borderUISize*5 + borderPadding*2, 'fly', 0, 20).setOrigin(0,0);
        this.fly03 = new fly(this, game.config.width, borderUISize*6 + borderPadding*4, 'fly', 0, 10).setOrigin(0,0);
        keyF= this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
        keyR= this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        keyLEFT= this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        keyRIGHT= this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        // animation config
        this.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNumbers('eating', { start: 0, end: 9, first: 0}),
            frameRate: 30
        });
        // initialize score
        this.p1Score = 0;
        //display score
        let scoreConfig = {
            fontFamily: 'Courier',
            fontSize: '28px',
            backgroundColor: '#c9b7ff',
            color: '#000000',
            align: 'right',
            padding:{
                top: 5,
                bottom: 5,
            },
            fixedWidth: 100
        }
        this.scoreLeft= this.add.text(borderUISize+borderPadding, borderUISize+borderPadding*2,
            this.p1Score, scoreConfig);
        // GAME OVER flag
        this.gameOver = false;
        //60 second play clock
        scoreConfig.fixedWidth = 0;
        this.clock = this.time.delayedCall(game.settings.gameTimer, () => {
            this.add.text(game.config.width/2, game.config.height/2, 'GAME OVER', scoreConfig).setOrigin(0.5);
            this.add.text(game.config.width/2, game.config.height/2 + 64, 'Press (R) to Restart or ← for Menu', scoreConfig).setOrigin(0.5);
            this.gameOver=true;
        }, null, this);
    }

    update(){
        // check key input for restart
        if (this.gameOver && Phaser.Input.Keyboard.JustDown(keyR)) {
            this.scene.restart();
        }
        if (this.gameOver && Phaser.Input.Keyboard.JustDown(keyLEFT)) {
            this.scene.start("menuScene");
        }
        this.background.tilePositionX-=4;
        if(!this.gameOver){
            this.p1frog.update();
            //update 3 flys
            this.fly01.update();
            this.fly02.update();
            this.fly03.update();
        }
        // check collisions
        if(this.checkCollision(this.p1frog, this.fly03)) {
            this.p1frog.reset();
            this.flyExplode(this.fly03);
        }
        if (this.checkCollision(this.p1frog, this.fly02)) {
            this.p1frog.reset();
            this.flyExplode(this.fly02);
        }
        if (this.checkCollision(this.p1frog, this.fly01)) {
            this.p1frog.reset();
            this.flyExplode(this.fly01);
        }
    }
    checkCollision(frog, fly) {
        //Axis-Aligned Bounding Boxes (AABB) checking
        if (frog.x < fly.x + fly.width && 
            frog.x + frog.width > fly.x && 
            frog.y < fly.y + fly.height &&
            frog.height + frog.y > fly. y) {
                return true;
        } else {
            return false;
        }
    }

    flyExplode(fly){
        //temp hide fly
        fly.alpha = 0;
        //create eating sprite where fly was
        let boom = this.add.sprite (fly.x, fly.y, 'eating').setOrigin(0,0);
        boom.anims.play('explode');
        boom.on('animationcomplete', () => {
            fly.reset();
            fly.alpha=1;
            boom.destroy;
        });
        //score add and repaint
        this.p1Score += fly.points;
        this.scoreLeft.text = this.p1Score;
        this.sound.play('sfx_eating');
    }
}