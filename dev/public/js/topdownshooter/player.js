/* 
 *  Player object
 */
function Player(game, position, resourceName){
    
    // First call the parent constructor
    Phaser.Sprite.call(this, game, position.x, position.y, resourceName);
    
    // Set the game variable for update
    this.game = game;
    
    // Players speed
    this.speed = 400;
    
    // Holds previous positions of the player
    this.path = [];

    // Add sprite to game
    game.add.existing(this);
    
    // Enable physics for dis sprite
    game.physics.enable(this, Phaser.Physics.ARCADE);
    
    this.body.collideWorldBounds = true;
   
    
    // Phaser physics body properties
   this.anchor.set(0.5);
    this.body.collideWorldBounds = true;
    this.body.bounce.setTo(0.1, 0.1);
    this.body.drag = 100;
    
    this.isFalling = false;
    this.isNextLevel = false;
    
    // Add the cursor inputs
    this.cursors = game.input.keyboard.createCursorKeys();
    
    // Create wasd movement
    this.w = game.input.keyboard.addKey(Phaser.Keyboard.W);
    this.a = game.input.keyboard.addKey(Phaser.Keyboard.A);
    this.s = game.input.keyboard.addKey(Phaser.Keyboard.S);
    this.d = game.input.keyboard.addKey(Phaser.Keyboard.D);
    
    this.scale.x = 1.3;
    this.scale.y = 1.3;
    
   this.body.setSize(25, 25, 0, 0);
    
}
// Inherit the Phaser.Sprite prototype
Player.prototype = Object.create(Phaser.Sprite.prototype);

// Assign the new constructor to Player constructor
Player.prototype.constructor = Player;



/*
 *  Update function called with every game update
 */
Player.prototype.update = function(){
    
    // Player movement
    this.move();
    
    // Player looks at mouses location
    this.rotation = this.game.physics.arcade.angleToPointer(this);
    
    // Make the player on top of graphics
    this.game.world.bringToTop(this);
    
    if(this.isFalling)
    {
        this.enterCellarDoor();
    }
    else
    {
        this.fallDown();
    }
    
};




/*
 * Function for player movement.  Reset the movement to 0 at the start of the function.
 * Therefore the player must hold down the key to move.
 */
Player.prototype.move = function(){
    
    
    // Set the players velocity to 0
    this.body.velocity.x = 0;
    this.body.velocity.y = 0;
    
    if(this.isFalling == false)
    {
        // If left arrow or 'a' is down
        if (this.cursors.left.isDown || this.a.isDown)
        {
        	this.body.velocity.x = -this.speed;
        }
        // Else if right arrow or 'd' is down
        else if (this.cursors.right.isDown || this.d.isDown)
        {
        	this.body.velocity.x = this.speed;
        }
    
        // If up arrow or 'w' is down
        if (this.cursors.up.isDown || this.w.isDown)
        {
        	this.body.velocity.y = -this.speed;
        }
        // Else if down arrow or 's' is down
        else if (this.cursors.down.isDown || this.s.isDown)
        {
        	this.body.velocity.y = this.speed;
        }
    }

};

Player.prototype.getRotation = function(){
    
    return this.rotation;
    
};

Player.prototype.enterCellarDoor = function(){
    
    
    
    if(this.scale.x > 0)
    {
        this.scale.setTo(this.scale.x - 0.025, this.scale.y - 0.025);
    }
    else
    {
        this.isNextLevel = true;
        this.isFalling = false;
        this.scale.setTo(3, 3);
    }
    
    
};



Player.prototype.fallDown = function(){
    
    
    
    if(this.scale.x > 1.4)
    {
        this.scale.setTo(this.scale.x - 0.07, this.scale.y - 0.07);
    }
    else
    {
        this.scale.setTo(1.3, 1.3);
        
    }
    
    
    
};

