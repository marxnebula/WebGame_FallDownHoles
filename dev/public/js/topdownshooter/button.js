/*
 * Button in game.  If main character touches it then it either opens the exit door or releases enemies.
 */
function Button(game, position, target, door, isRealButton, resourceName) {


    Phaser.Sprite.call(this, game, position.x, position.y, resourceName);

    // Add sprite to game
    game.add.existing(this);
    
    // Set the game variable for update
    this.game = game;
    
    // Set the exit door
    this.exitDoor = door;
    
    this.isRealButton = isRealButton;
    
    this.isReleaseMonsters = false;

    
    // Assign target that the object follows
    this.target = target;

    // Enable physics for dis sprite
    game.physics.enable(this, Phaser.Physics.ARCADE);
    
    this.body.collideWorldBounds = true;
    

    

}
// Inherit the Phaser.Sprite prototype
Button.prototype = Object.create(Phaser.Sprite.prototype);

// Assign the new constructor to FollowTarget constructor
Button.prototype.constructor = Button;



/*
 *  Update function called with every game update
 */
Button.prototype.update = function() {



    // If this sprite intersects with the target this call function collisionHandler
    this.game.physics.arcade.overlap(this, this.target, this.collisionHandler, null, this);

    
   
    
    

};


/*
 * This function is called when this sprite collides with the target.
 */
Button.prototype.collisionHandler = function(button, mainChar) {

    if(this.isRealButton)
    {
        this.exitDoor.isDoorOpen = true;
    }
    else
    {
        // Unlease da enemies
        this.isReleaseMonsters = true;
    }


};
