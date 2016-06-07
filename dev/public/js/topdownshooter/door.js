/*
 * Exit door is closed until real button is touched by main character.
 */
function Door(game, position, target, closedImage, openImage) {

    // First call the parent constructor
    Phaser.Sprite.call(this, game, position.x, position.y, closedImage);

    // Add sprite to game
    game.add.existing(this);
    
    this.openImage = openImage;
    
    // Set the game variable for update
    this.game = game;
    
    // Set the scale
    this.scale.x = 0.4;
    this.scale.y = 0.4;
    
    
    // Boolean for if door open
    this.isDoorOpen = false;
    
    this.isTargetEnterDoor = false;
    
    // Assign target that the object follows
    this.target = target;

    // Enable physics for dis sprite
    game.physics.enable(this, Phaser.Physics.ARCADE);
    
    // Set collideWorldBounds to true
    this.body.collideWorldBounds = true;
    
    // Set boolean to true
    this.doOnce = true;
    
    // Set the size of the collider
    this.body.setSize(100, 100, 60, 50);

    

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

    // If the door is open and doOnce is true
    if(this.isDoorOpen && this.doOnce)
    {
        // Since the texture changed image, we need to adjust the position to better align the collider
        this.position.x = this.position.x - 30;
        
        
        // Change sprite to opened door
        this.loadTexture(this.openImage);
        
        // Set doOnce to false
        this.doOnce = false;
    }
    
};


/*
 * This function is called when this sprite collides with the target.
 */
Door.prototype.collisionHandler = function(door, mainChar) {

    // If the door is open
    if(this.isDoorOpen)
    {
        // The player has collided with the open door so set the boolean to true
        this.isTargetEnterDoor = true;
        
        // Boolean to set off the player falling down to the next level
        mainChar.isFalling = true;
    }

};
