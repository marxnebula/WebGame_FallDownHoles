
/*
 * Kill certain # of zombies or survive the timer.
 */
var game = undefined;

var dff = {

    start: function() {

        game = new Phaser.Game(800, 600, Phaser.CANVAS, 'game', {
            preload: dff.preload,
            create: dff.create,
            update: dff.update,
            render: dff.render
        });

    },

    init: function() {

        dff.start();

    },

    preload: function() {
        /* Loading resources (images and things) */

        // Load the main chacater image
        game.load.image('mainCharacter', 'images/arrow.png');
        
        // Load the bullet image
        game.load.image('bullet', 'images/bullet.png');

        // Load airplane
        game.load.image('airplane', 'images/airplane.png');
        
        // Load background textures
        game.load.image('cloud', 'images/cloud.jpg');
        game.load.image('grass', 'images/grass.jpg');

    },

    create: function() {

        // Start physics
        game.physics.startSystem(Phaser.Physics.ARCADE);
      //   game.physics.startSystem(Phaser.Physics.P2JS);
        
        // Set the world boundaries
        game.world.setBounds(0, 0, 800, 600);
        
        // Set background color
      //  game.stage.backgroundColor = '#313131';
        
        // Create night
        dff.night = game.add.graphics();
        dff.night.beginFill(0x000000);
        dff.night.drawRect(0, 0, game.world.width, game.world.height);
        dff.night.endFill();
        
        // Create floor
        dff.floor = game.add.sprite(0, 0, 'cloud');
        
        // Create bullets
        dff.bullets = game.add.group();
        dff.bullets.enableBody = true;
        dff.bullets.physicsBodyType = Phaser.Physics.ARCADE;
        dff.bullets.createMultiple(50, 'bullet');
        dff.bullets.setAll('checkWorldBounds', true);
        dff.bullets.setAll('outOfBoundsKill', true);
        dff.fireRate = 100;
        dff.nextFire = 0;
        
        
        // Set the light radius
        dff.lightRadius = 200;
    
        
        // Create a player
        dff.player = new Player(game, {x: game.camera.width/2, y: game.camera.height/2}, 'mainCharacter');
        
        
        // Create monsters
        dff.monsters = game.add.group();
        dff.monstersAfterPlayerDead = game.add.group();
        /*
        for (var i = 0; i < 5; i++)
        {
            dff.x = game.rnd.between(0, 800);
            dff.y = game.rnd.between(0, 600);
        
            while(Math.abs(dff.x - dff.player.position.x) < dff.lightRadius && Math.abs(dff.y - dff.player.position.y) < dff.lightRadius)
            {
                dff.x = game.rnd.between(0, 800);
                dff.y = game.rnd.between(0, 600);
            }

            // Change to be random speed
            dff.monsters.add(new FollowTarget(game, {x: dff.x,  y: dff.y }, dff.player, 'airplane'));

        }
        */
        
        
        
        
        
        // Creates a texture that makes a shadow everywhere
        this.shadowTexture = this.game.add.bitmapData(game.world.width, game.world.height);

        // Create an object that will use the bitmap as a texture
        var lightSprite = this.game.add.image(0, 0, this.shadowTexture);
    
        // Set the blend mode to MULTIPLY. This will darken the colors of
        // everything below this sprite.
        lightSprite.blendMode = Phaser.blendModes.MULTIPLY;
        
        
        // Make the camera follow the main player
         game.camera.follow(dff.player, Phaser.Camera.FOLLOW_TOPDOWN);
         
         
         // Current wave
         dff.wave = 1;
         dff.newLevel = true;
         
         // Timer
         dff.deathTimer = 0;
         dff.respawnMonsterTime = 2;
         dff.monstersSpriteSizeTimer = 0;

        // Size of monsters sprite after player has died
         dff.monstersSpriteSize = 1;
         
         dff.isReleaseOnce = true;
         
     
    },

    update: function() {
        

        // Draw shadow texture
        this.shadowTexture.context.fillStyle = 'rgb(0, 0, 0)';
        this.shadowTexture.context.fillRect(0, 0, this.game.world.width, this.game.world.height);
    
        // Draw circle of light with a soft edge
        var gradient = this.shadowTexture.context.createRadialGradient(
            dff.player.x, dff.player.y, dff.lightRadius * 0.5,
            dff.player.x, dff.player.y, dff.lightRadius);
            
        
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
        

        this.shadowTexture.context.beginPath();
        this.shadowTexture.context.fillStyle = gradient;
        this.shadowTexture.context.arc(dff.player.x, dff.player.y,
            dff.lightRadius, 0, Math.PI*2);
        this.shadowTexture.context.fill();
    
        // This just tells the engine it should update the texture cache
        this.shadowTexture.dirty = true;
        
        // Creates the level
        dff.createLevel();
        
        // Determines if new level
        dff.determineIfNextLevel();
        
        // If Main character has died this will be called
        dff.userDeath();
        
        // If mouse click
        if (game.input.activePointer.isDown && dff.player.alive)
        {
            // If time is greater than nextFire
            if (game.time.now > dff.nextFire && dff.bullets.countDead() > 0)
            {
                // Add the current game time and fire rate
                dff.nextFire = game.time.now + dff.fireRate;
        
                var bullet = dff.bullets.getFirstDead();
        
                // Reset the bullet to be on the player
                bullet.reset(dff.player.x, dff.player.y);
        
                // Move the bullet to the pointer position
                game.physics.arcade.moveToPointer(bullet, 300);
                
        
            }
        }
        
        // If bullets overlap monsters then call collisionHandler
        game.physics.arcade.overlap(dff.bullets, dff.monsters, dff.collisionHandler, null, this);
        
        
      //  game.physics.arcade.collide(dff.monsters, this.target, this.collisionHandler, null, this);
      game.physics.arcade.collide(dff.monstersAfterPlayerDead, dff.monsters, dff.monstersAfterPlayerDeadCollisionHandler);
   
    },

    render: function() {

        // this.cloudMask.beginFill(0xffffff);
        // this.cloudMask.drawCircle(this.body.position.x, this.body.position.y, 100);
        // this.cloudMask.endFill();

      //  game.debug.text('Spawn:' + dff.newLevel, dff.player.x, dff.player.y + 32, 'rgba(255,0,255,1)', null);
        game.debug.text('Alive: ' + dff.monsters.countLiving(), dff.player.x, dff.player.y + 64, 'rgba(255,0,255,1)', null);
     //   game.debug.text('Timer: ' + dff.deathTimer, dff.player.x, dff.player.y + 96, 'rgba(255,0,255,1)', null);
     game.debug.text('Door ready:' + dff.door.isTargetEnterDoor, dff.player.x, dff.player.y + 32, 'rgba(255,0,255,1)', null);
     
    },
    
    
    collisionHandler: function(bullet, monster) {
        monster.kill();
    },
    
    monstersAfterPlayerDeadCollisionHandler: function(monsters, otherMonsters) {
        monsters.speed = 0;
        otherMonsters.speed = 0;
    },
    

    createLevel: function() {
        
        // Boolean for spawning the wave
        if(dff.newLevel)
        {
            // Wave increases by increments of 5
            for (var i = 0; i < dff.wave * 5; i++)
            {
                // Random number based on the screen
                dff.x = game.rnd.between(0, 800);
                dff.y = game.rnd.between(0, 600);
            
                // If the monsters position is spawned in light radius then keep trying until its not
                while(Math.abs(dff.x - dff.player.position.x) < dff.lightRadius && Math.abs(dff.y - dff.player.position.y) < dff.lightRadius)
                {
                    dff.x = game.rnd.between(0, 800);
                    dff.y = game.rnd.between(0, 600);
                }
    
                // Change to be random speed
                dff.monsters.add(new FollowTarget(game, {x: dff.x,  y: dff.y }, dff.player, 'airplane'));
    
            }
            
            
            
            // Random number based on the screen
            dff.doorX = game.rnd.between(0, 800);
            dff.doorY = game.rnd.between(0, 600);
            
            // Create door
            dff.door = new Door(game, {x: dff.doorX, y: dff.doorY}, dff.player, 'mainCharacter');
            
            
            dff.realButtonX = game.rnd.between(0, 800);
            dff.realButtonY = game.rnd.between(0, 600);
            
            // If the monsters position is spawned in light radius then keep trying until its not
            while(Math.abs(dff.realButtonX - dff.doorX) < 100 && Math.abs(dff.realButtonY - dff.doorY) < 100)
            {
                dff.realButtonX = game.rnd.between(0, 800);
                dff.realButtonY = game.rnd.between(0, 600);
            }
             
            // Create the real button
            dff.realButton = new Button(game,{x: dff.realButtonX, y: dff.realButtonY}, dff.player, dff.door, true, 'mainCharacter');
            
            
            
            dff.fakeButtonX = game.rnd.between(0, 800);
            dff.fakeButtonY = game.rnd.between(0, 600);
            
            // If the monsters position is spawned in light radius then keep trying until its not
            while(Math.abs(dff.fakeButtonX - dff.doorX) < 100 && Math.abs(dff.fakeButtonY - dff.doorY) < 100 &&
            Math.abs(dff.fakeButtonX - dff.realButtonX) < 100 && Math.abs(dff.fakeButtonY - dff.realButtonY) < 100)
            {
                dff.fakeButtonX = game.rnd.between(0, 800);
                dff.fakeButtonY = game.rnd.between(0, 600);
            }
            
            
            // Create the fake button
            dff.fakeButton = new Button(game,{x: dff.fakeButtonX, y: dff.fakeButtonY}, dff.player, dff.door, false, 'mainCharacter');
            
            // Set boolean to false
            dff.newLevel = false;
            
            dff.isReleaseOnce = true;
        }
        
        
    },
    
    
    userDeath: function() {
        
        // If the player is not alive
        if(!dff.player.alive)
        {
            // Display how many holes you fell through
            
            
            // Display retry button
            
            
            
            // Start timer
            dff.deathTimer = dff.deathTimer + 0.01;
            
            // If the timer is greater than respawnMosnterTime
            if(dff.deathTimer > dff.respawnMonsterTime)
            {
                // Random number based on the screen
                dff.x = game.rnd.between(0, 800);
                dff.y = game.rnd.between(0, 600);
            
                // If the monsters position is spawned in light radius then keep trying until its not
                while(Math.abs(dff.x - dff.player.position.x) < dff.lightRadius && Math.abs(dff.y - dff.player.position.y) < dff.lightRadius)
                {
                    dff.x = game.rnd.between(0, 800);
                    dff.y = game.rnd.between(0, 600);
                }
    
                dff.tempMonster = new FollowTarget(game, {x: dff.x,  y: dff.y }, dff.player, 'airplane');
                
                // Timer
                dff.monstersSpriteSizeTimer = dff.monstersSpriteSizeTimer + 0.1;
                
                if(dff.monstersSpriteSizeTimer > 20)
                {
                    dff.monstersSpriteSize = dff.monstersSpriteSize + 5;
                    dff.monstersSpriteSizeTimer = 0;
                }
                
                // Set sprite size
                dff.tempMonster.body.width = dff.monstersSpriteSize;
                dff.tempMonster.body.height = dff.monstersSpriteSize;
                
                
                // Change to be random speed
                dff.monstersAfterPlayerDead.add(dff.t);
                
                
                // Reset timer
                dff.deathTimer = 0;
                
                // Set random repawn monster time
                dff.respawnMonsterTime = game.rnd.between(0.5,3);
                
                
                
            }
        }
    },
    
    
    
    /*
     *
     */
    determineIfNextLevel: function() {
        
        // If all the monsters are dead then start the next wave
        if(dff.door.isTargetEnterDoor)
        {
            dff.door.isTargetEnterDoor = false;
            
            // Boolean for spawning the monsters
            dff.newLevel = true;
            
            // Increase the wave increment
            dff.wave = dff.wave + 1;
            
            // Kill all remaining monsters
            dff.monsters.removeBetween(0, dff.monsters.countLiving() - 1);
            
            // Remove the door and buttons
            dff.door.destroy();
            dff.realButton.destroy();
            dff.fakeButton.destroy();
        }
        
        if(dff.fakeButton.isReleaseMonsters && dff.isReleaseOnce)
        {
             // Wave increases by increments of 5
            for (var i = 0; i < 5; i++)
            {
                // Random number based on the screen
                dff.x = game.rnd.between(0, 800);
                dff.y = game.rnd.between(0, 600);
            
                // If the monsters position is spawned in light radius then keep trying until its not
                while(Math.abs(dff.x - dff.player.position.x) < dff.lightRadius && Math.abs(dff.y - dff.player.position.y) < dff.lightRadius)
                {
                    dff.x = game.rnd.between(0, 800);
                    dff.y = game.rnd.between(0, 600);
                }
    
                // Change to be random speed
                dff.tempFastMonster = new FollowTarget(game, {x: dff.x,  y: dff.y }, dff.player, 'airplane');
                dff.tempFastMonster.speed = dff.tempFastMonster.speed * dff.wave;
                dff.monsters.add(dff.tempFastMonster);
                
                
    
            }
            
            dff.fakeButton.isReleaseMonsters = false;
            dff.isReleaseOnce = false;
        }
    }
    


};

window.onload = function(){
    dff.start();
}



