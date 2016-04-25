
/*
 * Kill monsters as you find the button to open the cellar door.  There is a false button that releases more monsters.
 * See how many cellar doors you can fall through.
 */
var game = undefined;

var tds = {

    start: function() {

        game = new Phaser.Game(800, 600, Phaser.CANVAS, 'game', {
            preload: tds.preload,
            create: tds.create,
            update: tds.update,
            render: tds.render,
            goodbye: tds.goodbye
        });

    },

    init: function() {

        tds.start();

    },

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
    //    game.load.image('grass', 'images/grass.jpg');

    },

    create: function() {

        // Start physics
        game.physics.startSystem(Phaser.Physics.ARCADE);
      //   game.physics.startSystem(Phaser.Physics.P2JS);
        
        // Set the world boundaries
      ///  game.world.setBounds(0, 0, 800, 600);
        game.physics.setBoundsToWorld();
        
        // Set background color
     //   game.stage.backgroundColor = '#313131';
         
        
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

        tds.bullets.createMultiple(50, 'bullet');
        tds.bullets.setAll('checkWorldBounds', true);
        for(var p = 0; p < 50; p++)
        {
            tds.bullets.children[p].events.onOutOfBounds.add(tds.goodbye, this);
        }
        
     //   tds.bullets.setAll('outOfBoundsKill', true);
     
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
        tds.poo = true;
        
        // Make the camera follow the main player
         game.camera.follow(tds.player, Phaser.Camera.FOLLOW_TOPDOWN);
         
         
         // Current wave
         tds.wave = 1;
         tds.newLevel = true;
         
         // Timer
         tds.deathTimer = 0;
         tds.respawnMonsterTime = 2;
         tds.monstersSpriteSizeTimer = 0;

        // Size of monsters sprite after player has died
         tds.monstersSpriteSize = 1;
         
         tds.isReleaseOnce = true;
         
     
    },

    update: function() {
        
        // Creates the level
        tds.createLevel();
        
        // Determines if new level
        tds.determineIfNextLevel();
        
        
        // If mouse click
        if (game.input.activePointer.isDown && tds.player.alive)
        {
            // If time is greater than nextFire
            if (game.time.now > tds.nextFire && tds.bullets.countDead() > 0)
            {
                // Add the current game time and fire rate
                tds.nextFire = game.time.now + tds.fireRate;
        
              //  var bullet = tds.bullets.getFirstDead();
                var bullet = tds.bullets.children[tds.bulletIndex];
                
        
                // Reset the bullet to be on the player
                bullet.reset(tds.player.x, tds.player.y);
                bullet.anchor.set(0.5);
                
                bullet.rotation = tds.player.getRotation();
        
                // Move the bullet to the pointer position
                game.physics.arcade.moveToPointer(bullet, 300);
                
                tds.bulletIndex++;
            }
        }
        
        if(tds.poo)
        {
            
        
            // Create an object that will use the bitmap as a texture
            var lightSprite = this.game.add.image(0, 0, this.shadowTexture);
        
            // Set the blend mode to MULTIPLY. This will darken the colors of
            // everything below this sprite.
            lightSprite.blendMode = Phaser.blendModes.MULTIPLY;
            
            
            tds.poo = false;
            
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
        
        

        this.shadowTexture.context.beginPath();
        this.shadowTexture.context.fillStyle = gradient;
        this.shadowTexture.context.arc(tds.player.x, tds.player.y,
            tds.lightRadius, 0, Math.PI*2);
        this.shadowTexture.context.fill();
            
            
            /*
         // Draw circle of light with a soft edge
        var gradient1 = this.shadowTexture.context.createRadialGradient(
            tds.monsters.getFirstAlive().position.x, tds.monsters.getFirstAlive().position.y, tds.lightRadius * 0.5,
            tds.monsters.getFirstAlive().position.x, tds.monsters.getFirstAlive().position.y, tds.lightRadius);

        gradient1.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
        gradient1.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
        
        this.shadowTexture.context.fillStyle = gradient1;
        this.shadowTexture.context.arc(tds.monsters.getFirstAlive().position.x, tds.monsters.getFirstAlive().position.y,
            tds.lightRadius, 0, Math.PI*2);
        this.shadowTexture.context.fill();
    
        // This just tells the engine it should update the texture cache
        this.shadowTexture.dirty = true;
        */
        
     //   if(tds.bullets.children.countLiving > 0)
      //  {
            
            for(var i = 0; i < tds.bulletIndex; i++)
            {
                
                if(tds.bullets.children[i].alive)
               {
                // Draw circle of light with a soft edge
        var gradient1 = this.shadowTexture.context.createRadialGradient(
            tds.bullets.children[i].position.x, tds.bullets.children[i].position.y, tds.lightRadius * 0.5,
            tds.bullets.children[i].position.x, tds.bullets.children[i].position.y, tds.lightRadius);

        gradient1.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
        gradient1.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
        
        this.shadowTexture.context.fillStyle = gradient1;
        this.shadowTexture.context.arc(tds.bullets.children[i].position.x, tds.bullets.children[i].position.y,
            tds.lightRadius, 0, Math.PI*2);
        this.shadowTexture.context.fill();
    
        // This just tells the engine it should update the texture cache
        this.shadowTexture.dirty = true;
                }
                
          
            }
            
            
        
       // }
        

        
        // If Main character has died this will be called
        tds.userDeath();
        
        
        
        // If bullets overlap monsters then call collisionHandler
        game.physics.arcade.overlap(tds.bullets, tds.monsters, tds.collisionHandler, null, this);
        
        
      //  game.physics.arcade.collide(tds.monsters, this.target, this.collisionHandler, null, this);
      game.physics.arcade.collide(tds.monstersAfterPlayerDead, tds.monsters, tds.monstersAfterPlayerDeadCollisionHandler);
      
      
   
    },

    render: function() {

        // this.cloudMask.beginFill(0xffffff);
        // this.cloudMask.drawCircle(this.body.position.x, this.body.position.y, 100);
        // this.cloudMask.endFill();

        game.debug.text('Spawn:' + tds.newLevel, tds.player.x, tds.player.y + 32, 'rgba(255,0,255,1)', null);
        game.debug.text('Alive: ' + tds.monsters.countLiving(), tds.player.x, tds.player.y + 64, 'rgba(255,0,255,1)', null);
        game.debug.body(tds.bullets.children[0]);
  //   game.debug.body(tds.player);
     //   game.debug.text('Timer: ' + tds.deathTimer, tds.player.x, tds.player.y + 96, 'rgba(255,0,255,1)', null);
   //  game.debug.text('Door ready:' + tds.door.isTargetEnterDoor, tds.player.x, tds.player.y + 32, 'rgba(255,0,255,1)', null);
     
    },
    
    
    collisionHandler: function(bullet, monster) {
        monster.kill();
        bullet.body.velocity.x = 0;
        bullet.body.velocity.y = 0;
        bullet.body.enable = false;
    },
    
    monstersAfterPlayerDeadCollisionHandler: function(monsters, otherMonsters) {
        monsters.speed = 0;
        otherMonsters.speed = 0;
    },
    

    goodbye: function(obj) {
        obj.body.velocity.x = 0;
        obj.body.velocity.y = 0;
    },
    

    createLevel: function() {
        
        // Boolean for spawning the wave
        if(tds.newLevel)
        {
           for(var c = 0; c < tds.bullets.children.length; c++)
           {
          //     tds.bullets.children[c].reset(0,0);
           }
            
            // Random number based on the screen
            tds.doorX = game.rnd.between(0, 800);
            tds.doorY = game.rnd.between(0, 600);
            
            // Create door
            tds.door = new Door(game, {x: tds.doorX, y: tds.doorY}, tds.player, 'cellardoorclosed', 'cellardooropen');
            
            
            tds.realButtonX = game.rnd.between(0, 800);
            tds.realButtonY = game.rnd.between(0, 600);
            
            // If the monsters position is spawned in light radius then keep trying until its not
            while(Math.abs(tds.realButtonX - tds.doorX) > 130 && Math.abs(tds.realButtonY - tds.doorY) > 130)
            {
                tds.realButtonX = game.rnd.between(0, 800);
                tds.realButtonY = game.rnd.between(0, 600);
            }
             
            // Create the real button
            tds.realButton = new Button(game,{x: tds.realButtonX, y: tds.realButtonY}, tds.player, tds.door, true, 'button', 'buttoncorrect', 'buttonwrong');
            
            
            
            tds.fakeButtonX = game.rnd.between(0, 800);
            tds.fakeButtonY = game.rnd.between(0, 600);
            
            // If the monsters position is spawned in light radius then keep trying until its not
            while(Math.abs(tds.fakeButtonX - tds.doorX) > 130 && Math.abs(tds.fakeButtonY - tds.doorY) > 130 &&
            Math.abs(tds.fakeButtonX - tds.realButtonX) > 100 && Math.abs(tds.fakeButtonY - tds.realButtonY) > 100)
            {
                tds.fakeButtonX = game.rnd.between(0, 800);
                tds.fakeButtonY = game.rnd.between(0, 600);
            }
            
            
            // Create the fake button
            tds.fakeButton = new Button(game,{x: tds.fakeButtonX, y: tds.fakeButtonY}, tds.player, tds.door, false, 'button', 'buttoncorrect', 'buttonwrong');
            
            
            
             // Wave increases by increments of 5
            for (var i = 0; i < tds.wave * 3; i++)
            {
                // Random number based on the screen
                tds.x = game.rnd.between(0, 800);
                tds.y = game.rnd.between(0, 600);
            
                // If the monsters position is spawned in light radius then keep trying until its not
                while(Math.abs(tds.x - tds.player.position.x) < tds.lightRadius && Math.abs(tds.y - tds.player.position.y) < tds.lightRadius)
                {
                    tds.x = game.rnd.between(0, 800);
                    tds.y = game.rnd.between(0, 600);
                }
    
                // Change to be random speed
                tds.monsters.add(new FollowTarget(game, {x: tds.x,  y: tds.y }, tds.player, 'monster'));
    
            }
            
            
            // Set boolean to false
            tds.newLevel = false;
            
            tds.isReleaseOnce = true;
            tds.poo = true;
        }
        
        
    },
    
    
    userDeath: function() {
        
        // If the player is not alive
        if(!tds.player.alive)
        {
            // Display how many holes you fell through
            
            
            // Display retry button
            
            
            
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
                    tds.x = game.rnd.between(0, 800);
                    tds.y = game.rnd.between(0, 600);
                }
    
                tds.tempMonster = new FollowTarget(game, {x: tds.x,  y: tds.y }, tds.player, 'monster');
                tds.tempMonster.game.world.bringToTop(tds.tempMonster);
                
                // Timer
                tds.monstersSpriteSizeTimer = tds.monstersSpriteSizeTimer + 0.1;
                
                if(tds.monstersSpriteSizeTimer > 20)
                {
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
     *
     */
    determineIfNextLevel: function() {
        
        
        if(tds.player.isNextLevel)
        {
            tds.player.isNextLevel = false;
            
            // Boolean for spawning the monsters
            tds.newLevel = true;
            
            // Increase the wave increment
            tds.wave = tds.wave + 1;
            
            // Kill all remaining monsters
            tds.monsters.removeBetween(0, tds.monsters.countLiving() - 1);
            
            tds.bullets.removeBetween(0, tds.bullets.children.length - 1);
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
            tds.poo = true;
        }
        
        if(tds.fakeButton.isReleaseMonsters && tds.isReleaseOnce)
        {
             // Wave increases by increments of 5
            for (var i = 0; i < 5; i++)
            {
                // Random number based on the screen
                tds.x = game.rnd.between(0, 800);
                tds.y = game.rnd.between(0, 600);
            
                // If the monsters position is spawned in light radius then keep trying until its not
                while(Math.abs(tds.x - tds.player.position.x) < tds.lightRadius && Math.abs(tds.y - tds.player.position.y) < tds.lightRadius)
                {
                    tds.x = game.rnd.between(0, 800);
                    tds.y = game.rnd.between(0, 600);
                }
    
                // Change to be random speed
                tds.tempFastMonster = new FollowTarget(game, {x: tds.x,  y: tds.y }, tds.player, 'monsterspecial');
                tds.tempFastMonster.speed = tds.tempFastMonster.speed * tds.wave;
                tds.monsters.add(tds.tempFastMonster);
                
                
    
            }
            
            tds.fakeButton.isReleaseMonsters = false;
            tds.isReleaseOnce = false;
        }
    }
    


};

window.onload = function(){
    tds.start();
}



