/*
 * Used for monster to follow player.
 * If the monster touches the player then the player dies.
 * Monster receives a random speed.
 */
function FollowTarget(game, position, target, resourceName) {

    // First call the parent constructor
    Phaser.Sprite.call(this, game, position.x, position.y, resourceName);

    // Add sprite to game
    game.add.existing(this);
    
    // Set the game variable for update
    this.game = game;
    
    // Anchor dat shit
    this.anchor.set(0.5);
   
    // Speed of movement
    this.speed = game.rnd.between(10, 30);
    
    // Assign target that the object follows
    this.target = target;

    // Enable physics for dis sprite
    game.physics.enable(this, Phaser.Physics.ARCADE);
    
    // Set the collideWorldBounds to true
    this.body.collideWorldBounds = true;
    
    // Set the collider size
    this.body.setSize(52, 52, -5, -10);
    
    
    

}
// Inherit the Phaser.Sprite prototype
FollowTarget.prototype = Object.create(Phaser.Sprite.prototype);

// Assign the new constructor to FollowTarget constructor
FollowTarget.prototype.constructor = FollowTarget;




/*
 *  Update function called with every game update
 */
FollowTarget.prototype.update = function() {

    //  If the sprite is > 8px away from the pointer then let's move to it
    if (this.game.physics.arcade.distanceBetween(this, this.target) > 2) {

        //  Make the object seek to the active pointer (mouse or touch).
        this.game.physics.arcade.moveToObject(this, this.target, this.speed);

    }
    else {

        //  Otherwise turn off velocity because we're close enough to the pointer
        this.body.velocity.set(0);
    }


    // If this sprite intersects with the target this call function collisionHandler
    this.game.physics.arcade.collide(this, this.target, this.collisionHandler, null, this);
    
    // Set the rotation to be looking at the target
    this.rotation = this.game.physics.arcade.angleBetween(this, this.target);
    

};


/*
 * This function is called when this sprite collides with the target.
 */
FollowTarget.prototype.collisionHandler = function(followingTarget, mainChar) {

    //  Kill main character
    mainChar.kill();

};


