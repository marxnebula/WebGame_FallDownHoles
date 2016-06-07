
/*
 * ~~~~~~~~~ FALL DOWN HOLES ~~~~~~~~~
 * Kill monsters as you find the button to open the cellar door.  There is a false button that releases more monsters.
 * See how many cellar doors you can fall through.
 */
var game = undefined;

var tds = {

    // Start function
    start: function() {

        // Game variable
        game = new Phaser.Game(800, 600, Phaser.CANVAS, 'game', {
            preload: tds.preload,
            create: tds.create,
            update: tds.update,
            render: tds.render,
            goodbye: tds.goodbye
        });

    },

    /* 
     * Initialization function.
     * Calls the function start()
     */
    init: function() {

        // Start the game
        tds.start();

    },

    /*
     * Load the assets
     */
    preload: function() {
        /* Loading resources (images and things) */

        // Load the main chacater image
        game.load.image('mainCharacter', 'images/MainCharacter.png');
        
        // Load the bullet image
        game.load.image('bullet', 'images/Arrow.png');

        // Load Monster
        game.load.image('monster', 'images/Monster.png');
        
        // Load Special Monster
        game.load.image('monsterspecial', 'images/MonsterSpecial.png');
        
        // Load the button
        game.load.image('button', 'images/Button.png');
        
        // Load the correct button
        game.load.image('buttoncorrect', 'images/ButtonCorrect.png');
        
        // Load the wrong button
        game.load.image('buttonwrong', 'images/ButtonWrong.png');
        
        // Load the Closed Cellar door
        game.load.image('cellardoorclosed', 'images/CellarDoorClosed.png');
        
        // Load the open Cellar door
        game.load.image('cellardooropen', 'images/CellarDoorOpen.png');
        
        // Load background textures
        game.load.image('bg', 'images/bg.png');
        

    },

    /*
     * Create function.
     * Only called once at the start of the game.
     * It starts the physics, world boundaries, and initializes the objects.
     */
    create: function() {

        // Start physics
        game.physics.startSystem(Phaser.Physics.ARCADE);
        // game.physics.startSystem(Phaser.Physics.P2JS);
        
        // Set the world boundaries
        game.physics.setBoundsToWorld();
        
        // Replay button
         tds.replayKey = game.input.keyboard.addKey(Phaser.Keyboard.R);
         
        
        // Create night
        tds.night = game.add.graphics();
        tds.night.beginFill(0x000000);
        tds.night.drawRect(0, 0, game.world.width, game.world.height);
        tds.night.endFill();
        
        // Create floor
        tds.floor = game.add.sprite(0, 0, 'bg');
        
        // Create bullets
        tds.bullets = game.add.group();
        tds.bullets.enableBody = true;
        tds.bullets.physicsBodyType = Phaser.Physics.ARCADE;

        // Creates 50 bullets
        tds.bullets.createMultiple(50, 'bullet');
        tds.bullets.setAll('checkWorldBounds', true);
        for(var p = 0; p < 50; p++)
        {
            tds.bullets.children[p].events.onOutOfBounds.add(tds.goodbye, this);
        }
        
     
        // Bullet fire rate variables
        tds.fireRate = 100;
        tds.nextFire = 0;
        tds.bulletIndex = 0;
        
        
        // Set the light radius
        tds.lightRadius = 200;
    
        
        // Create a player
        tds.player = new Player(game, {x: game.camera.width/2, y: game.camera.height/2}, 'mainCharacter');
        
        
        // Create monsters
        tds.monsters = game.add.group();
        tds.monstersAfterPlayerDead = game.add.group();
        
        
        
        // Creates a texture that makes a shadow everywhere
        this.shadowTexture = this.game.add.bitmapData(game.world.width, game.world.height);

        // Create an object that will use the bitmap as a texture
        var lightSprite = this.game.add.image(0, 0, this.shadowTexture);
    
        // Set the blend mode to MULTIPLY. This will darken the colors of
        // everything below this sprite.
        lightSprite.blendMode = Phaser.blendModes.MULTIPLY;
        
        // Boolean for creating lightSprite once in Update
        tds.isLightSprite = true;
        
        // Make the camera follow the main player
         game.camera.follow(tds.player, Phaser.Camera.FOLLOW_TOPDOWN);
         
         
         // Current wave
         tds.wave = 3;
         tds.newLevel = true;
         
         // Timer
         tds.deathTimer = 0;
         tds.respawnMonsterTime = 2;
         tds.monstersSpriteSizeTimer = 0;

         // Size of monsters sprite after player has died
         tds.monstersSpriteSize = 1;
          
         // Set boolean to true
         tds.isReleaseOnce = true;
         
     
    },

    /*
     * Update function.
     */
    update: function() {
        
        // Creates the level
        tds.createLevel();
        
        // Determines if new level
        tds.determineIfNextLevel();
        
        
        // If mouse click and player is alive
        if (game.input.activePointer.isDown && tds.player.alive)
        {
            // If time is greater than nextFire
            if (game.time.now > tds.nextFire && tds.bullets.countDead() > 0)
            {
                // Add the current game time and fire rate
                tds.nextFire = game.time.now + tds.fireRate;
        
                // Get the bullet corresponding to the bulletIndex
                var bullet = tds.bullets.children[tds.bulletIndex];
                
        
                // Reset the bullet to be on the player
                bullet.reset(tds.player.x, tds.player.y);
                bullet.anchor.set(0.5);
                
                // Set bullets rotation to the players
                bullet.rotation = tds.player.getRotation();
        
                // Move the bullet to the pointer position
                game.physics.arcade.moveToPointer(bullet, 300);
                
                // Add one to bullet index
                tds.bulletIndex++;
            }
        }
        
        // If isLightSprite is true
        if(tds.isLightSprite)
        {
            
        
            // Create an object that will use the bitmap as a texture
            var lightSprite = this.game.add.image(0, 0, this.shadowTexture);
        
            // Set the blend mode to MULTIPLY. This will darken the colors of
            // everything below this sprite.
            lightSprite.blendMode = Phaser.blendModes.MULTIPLY;
            
            // Set boolean to false
            tds.isLightSprite = false;
            
        }

        // Draw shadow texture
        this.shadowTexture.context.fillStyle = 'rgb(0, 0, 0)';
        this.shadowTexture.context.fillRect(0, 0, this.game.world.width, this.game.world.height);
    
        // Draw circle of light with a soft edge
        var gradient = this.shadowTexture.context.createRadialGradient(
            tds.player.x, tds.player.y, tds.lightRadius * 0.5,
            tds.player.x, tds.player.y, tds.lightRadius);

        gradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
        
        
        // Fills the circle path with the gradient 
        this.shadowTexture.context.beginPath();
        this.shadowTexture.context.fillStyle = gradient;
        this.shadowTexture.context.arc(tds.player.x, tds.player.y,
            tds.lightRadius, 0, Math.PI*2);
        this.shadowTexture.context.fill();
            
            
        // Loop for making the gradient for every bullet shot
        for(var i = 0; i < tds.bulletIndex; i++)
        {
            
            // If the bullet is alive
            if(tds.bullets.children[i].alive)
            {
                // Draw circle of light with a soft edge
                var gradient1 = this.shadowTexture.context.createRadialGradient(
                    tds.bullets.children[i].position.x, tds.bullets.children[i].position.y, tds.lightRadius * 0.5,
                    tds.bullets.children[i].position.x, tds.bullets.children[i].position.y, tds.lightRadius);

                gradient1.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
                gradient1.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
                
                 // Fills the circle path with the gradient 
                this.shadowTexture.context.fillStyle = gradient1;
                this.shadowTexture.context.arc(tds.bullets.children[i].position.x, tds.bullets.children[i].position.y,
                    tds.lightRadius, 0, Math.PI*2);
                this.shadowTexture.context.fill();
            
                // This just tells the engine it should update the texture cache
                this.shadowTexture.dirty = true;
            }
                
          
        }
            
            
        
        // If Main character has died this will be called
        tds.userDeath();
        
        
        // If bullets overlap monsters then call collisionHandler
        game.physics.arcade.overlap(tds.bullets, tds.monsters, tds.collisionHandler, null, this);
        
        
        //  game.physics.arcade.collide(tds.monsters, this.target, this.collisionHandler, null, this);
        game.physics.arcade.collide(tds.monstersAfterPlayerDead, tds.monsters, tds.monstersAfterPlayerDeadCollisionHandler);
      
      
   
    },


    /*
     * Render function.
     * Used for debug text only right now.
     */
    render: function() {


        /* DEBUG TEXT */
        game.debug.text('If dead press R to replay ', 25, 50, 'rgba(255,0,255,1)', null);
        game.debug.text('Monsters Alive: ' + tds.monsters.countLiving(), tds.player.x, tds.player.y + 32, 'rgba(255,0,255,1)', null);

     
    },
    
    
    /* 
     * Collision handler for bullets and monsters
     */
    collisionHandler: function(bullet, monster) {
        
        // Kill the monster
        monster.kill();
        
        // Stop the bullet from moving
        bullet.body.velocity.x = 0;
        bullet.body.velocity.y = 0;
        
        // Turn off collision of bullet
        bullet.body.enable = false;
    },
    
    /* Collision handler for monsters when the player is dead.
     * It's designed to make the monsters stop moving once they touch the another monster.
     */
    monstersAfterPlayerDeadCollisionHandler: function(monsters, otherMonsters) {
        
        // Set the monsters speed to 0
        monsters.speed = 0;
        
        // Set the other monsters speed to 0
        otherMonsters.speed = 0;
    },
    

    /*
     * Function for seeting the obj's velocity to 0
     */
    goodbye: function(obj) {
        
        // Set the obj veloctiy to 0
        obj.body.velocity.x = 0;
        obj.body.velocity.y = 0;
    },
    

    
    /*
     * Function for creating the level.
     * Creates the monsters, buttons, and door.
     * It makes sure that nothing is stacked on top of each other.
     */
    createLevel: function() {
        
        // Boolean for spawning the wave
        if(tds.newLevel)
        {
            
            // Random number based on the screen size for the door
            tds.doorX = game.rnd.between(0, 800);
            tds.doorY = game.rnd.between(0, 600);
            
            // Create door
            tds.door = new Door(game, {x: tds.doorX, y: tds.doorY}, tds.player, 'cellardoorclosed', 'cellardooropen');
            
            // Random number based on the screen size for the real button
            tds.realButtonX = game.rnd.between(0, 800);
            tds.realButtonY = game.rnd.between(0, 600);
            
            // If the monsters position is spawned in light radius then keep trying until its not
            while(Math.abs(tds.realButtonX - tds.doorX) > 130 && Math.abs(tds.realButtonY - tds.doorY) > 130)
            {
                // Random number based on the screen size for the real button
                tds.realButtonX = game.rnd.between(0, 800);
                tds.realButtonY = game.rnd.between(0, 600);
            }
             
            // Create the real button
            tds.realButton = new Button(game,{x: tds.realButtonX, y: tds.realButtonY}, tds.player, tds.door, true, 'button', 'buttoncorrect', 'buttonwrong');
            
            
            // Random number based on the screen size for the fake button
            tds.fakeButtonX = game.rnd.between(0, 800);
            tds.fakeButtonY = game.rnd.between(0, 600);
            
            // If the monsters position is spawned in light radius then keep trying until its not
            while(Math.abs(tds.fakeButtonX - tds.doorX) > 130 && Math.abs(tds.fakeButtonY - tds.doorY) > 130 &&
            Math.abs(tds.fakeButtonX - tds.realButtonX) > 100 && Math.abs(tds.fakeButtonY - tds.realButtonY) > 100)
            {
                // Random number based on the screen size for the fake button
                tds.fakeButtonX = game.rnd.between(0, 800);
                tds.fakeButtonY = game.rnd.between(0, 600);
            }
            
            
            // Create the fake button
            tds.fakeButton = new Button(game,{x: tds.fakeButtonX, y: tds.fakeButtonY}, tds.player, tds.door, false, 'button', 'buttoncorrect', 'buttonwrong');
            
            
            
             // Wave increases by increments
            for (var i = 0; i < tds.wave; i++)
            {
                // Random number based on the screen
                tds.x = game.rnd.between(0, 800);
                tds.y = game.rnd.between(0, 600);
            
                // If the monsters position is spawned in light radius then keep trying until its not
                while(Math.abs(tds.x - tds.player.position.x) < tds.lightRadius && Math.abs(tds.y - tds.player.position.y) < tds.lightRadius)
                {
                    // Random number based on the screen size for the monsters
                    tds.x = game.rnd.between(0, 800);
                    tds.y = game.rnd.between(0, 600);
                }
    
                
                 
                // Create the new monster
                tds.newMonster = new FollowTarget(game, {x: tds.x,  y: tds.y }, tds.player, 'monster');
                
                // Add the monster to the group
                tds.monsters.add(tds.newMonster);
    
            }
            
            // Increase the wave
            tds.wave++;
            
            // Set booleans to false
            tds.newLevel = false;
            tds.isReleaseOnce = true;
            tds.isLightSprite = true;
        }
        
        
    },
    
    
    /*
     * Function for when the player is dead.
     * It sets off unlimited monsters based off of a timer.
     */
    userDeath: function() {
        
        // If the player is not alive
        if(!tds.player.alive)
        {
            
            if(tds.replayKey.isDown)
            {
                // Replay level
                tds.wave = 3;
                
                // Set boolean to false
                tds.player.isNextLevel = false;
                
                // Boolean for spawning the monsters
                tds.newLevel = true;
                
                
                // Kill all remaining monsters
                tds.monsters.removeBetween(0, tds.monsters.children.length - 1);
                
                
                // Kill all the bullets
                tds.bullets.removeBetween(0, tds.bullets.children.length - 1);
                
                // Recreate the bullets
                tds.bullets.createMultiple(50, 'bullet');
                tds.bullets.setAll('checkWorldBounds', true);
                for(var p = 0; p < 50; p++)
                {
                    tds.bullets.children[p].events.onOutOfBounds.add(tds.goodbye, this);
                }
                
                // Remove the door and buttons
                tds.door.destroy();
                tds.realButton.destroy();
                tds.fakeButton.destroy();
                tds.isLightSprite = true;
                
                tds.player.reset(200, 300);
                
                tds.createLevel();
            }
            
            // Start timer
            tds.deathTimer = tds.deathTimer + 0.01;
            
            // If the timer is greater than respawnMosnterTime
            if(tds.deathTimer > tds.respawnMonsterTime)
            {
                // Random number based on the screen
                tds.x = game.rnd.between(0, 800);
                tds.y = game.rnd.between(0, 600);
            
                // If the monsters position is spawned in light radius then keep trying until its not
                while(Math.abs(tds.x - tds.player.position.x) < tds.lightRadius && Math.abs(tds.y - tds.player.position.y) < tds.lightRadius)
                {
                    // Random number based on the screen size for the monsters
                    tds.x = game.rnd.between(0, 800);
                    tds.y = game.rnd.between(0, 600);
                }
    
                // Create the monster
                tds.tempMonster = new FollowTarget(game, {x: tds.x,  y: tds.y }, tds.player, 'monster');
                tds.tempMonster.game.world.bringToTop(tds.tempMonster);
                
                // Timer
                tds.monstersSpriteSizeTimer = tds.monstersSpriteSizeTimer + 0.1;
                
                // If the timer is greater than 20
                if(tds.monstersSpriteSizeTimer > 20)
                {
                    // Increase the monster sprite size and reset the timer
                    tds.monstersSpriteSize = tds.monstersSpriteSize + 5;
                    tds.monstersSpriteSizeTimer = 0;
                }
                
                // Set sprite size
                tds.tempMonster.body.width = tds.monstersSpriteSize;
                tds.tempMonster.body.height = tds.monstersSpriteSize;
                
                
                // Change to be random speed
                tds.monstersAfterPlayerDead.add(tds.tempMonster);
                
                
                // Reset timer
                tds.deathTimer = 0;
                
                // Set random repawn monster time
                tds.respawnMonsterTime = game.rnd.between(0.5,3);
                
                
                
            }
        }
    },
    
    
    
    /*
     * Function for determing if player beat the level.
     */
    determineIfNextLevel: function() {
        
        // If the fake button is pressed and isReleaseOnce is true
        if(tds.fakeButton.isReleaseMonsters && tds.isReleaseOnce)
        {
            // Loop to release the 5 monsters
            for (var i = 0; i < 5; i++)
            {
                // Random number based on the screen for the monsters
                tds.x = game.rnd.between(0, 800);
                tds.y = game.rnd.between(0, 600);
            
                // If the monsters position is spawned in light radius then keep trying until its not
                while(Math.abs(tds.x - tds.player.position.x) < tds.lightRadius && Math.abs(tds.y - tds.player.position.y) < tds.lightRadius)
                {
                    // Random number based on the screen size for the monsters
                    tds.x = game.rnd.between(0, 800);
                    tds.y = game.rnd.between(0, 600);
                }
    
                // Change to be random speed
                tds.tempFastMonster = new FollowTarget(game, {x: tds.x,  y: tds.y }, tds.player, 'monsterspecial');
                tds.monsters.add(tds.tempFastMonster);
                
                
    
            }
            
            // Set booleans to false
            tds.fakeButton.isReleaseMonsters = false;
            tds.isReleaseOnce = false;
        }
        
        // If the player's boolean isNextLevel is true
        if(tds.player.isNextLevel)
        {
            // Set boolean to false
            tds.player.isNextLevel = false;
            
            // Boolean for spawning the monsters
            tds.newLevel = true;
            
            
            // Kill all remaining monsters
            tds.monsters.removeBetween(0, tds.monsters.children.length - 1);
            
            
            // Kill all the bullets
            tds.bullets.removeBetween(0, tds.bullets.children.length - 1);
            
            // Recreate the bullets
            tds.bullets.createMultiple(50, 'bullet');
            tds.bullets.setAll('checkWorldBounds', true);
            for(var p = 0; p < 50; p++)
            {
                tds.bullets.children[p].events.onOutOfBounds.add(tds.goodbye, this);
            }
            
            // Remove the door and buttons
            tds.door.destroy();
            tds.realButton.destroy();
            tds.fakeButton.destroy();
            tds.isLightSprite = true;
        }
        
        
    }
    


};

window.onload = function(){
    tds.start();
}



