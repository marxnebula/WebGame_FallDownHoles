/*
 * Exit door is closed until button is touched by main character.
 */
function Door(game, position, target, resourceName) {


    Phaser.Sprite.call(this, game, position.x, position.y, resourceName);

    // Add sprite to game
    game.add.existing(this);
    
    // Set the game variable for update
    this.game = game;
    
    
    // Boolean for if door open
    this.isDoorOpen = false;
    
    this.isTargetEnterDoor = false;
    
    // Assign target that the object follows
    this.target = target;

    // Enable physics for dis sprite
    game.physics.enable(this, Phaser.Physics.ARCADE);
    
    this.body.collideWorldBounds = true;
    

    

}
// Inherit the Phaser.Sprite prototype
Door.prototype = Object.create(Phaser.Sprite.prototype);

// Assign the new constructor to FollowTarget constructor
Door.prototype.constructor = Door;



/*
 *  Update function called with every game update
 */
Door.prototype.update = function() {



    // If this sprite intersects with the target this call function collisionHandler
    this.game.physics.arcade.overlap(this, this.target, this.collisionHandler, null, this);

    
};


/*
 * This function is called when this sprite collides with the target.
 */
Door.prototype.collisionHandler = function(door, mainChar) {

    if(this.isDoorOpen)
    {
        this.isTargetEnterDoor = true;
    }

};
