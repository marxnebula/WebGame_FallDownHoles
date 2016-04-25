/*
 * Exit door is closed until button is touched by main character.
 */
function Door(game, position, target, closedImage, openImage) {


    Phaser.Sprite.call(this, game, position.x, position.y, closedImage);

    // Add sprite to game
    game.add.existing(this);
    
    this.openImage = openImage;
    
    // Set the game variable for update
    this.game = game;
    
    this.scale.x = 0.4;
    this.scale.y = 0.4;
    
    
    // Boolean for if door open
    this.isDoorOpen = false;
    
    this.isTargetEnterDoor = false;
    
    // Assign target that the object follows
    this.target = target;

    // Enable physics for dis sprite
    game.physics.enable(this, Phaser.Physics.ARCADE);
    
    this.body.collideWorldBounds = true;
    
    this.doOnce = true;
    
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

    if(this.isDoorOpen && this.doOnce)
    {
        this.position.x = this.position.x - 30;
        // Change sprite to opened door
        this.loadTexture(this.openImage);
        this.doOnce = false;
    }
    
};


/*
 * This function is called when this sprite collides with the target.
 */
Door.prototype.collisionHandler = function(door, mainChar) {

    if(this.isDoorOpen)
    {
        this.isTargetEnterDoor = true;
        mainChar.isFalling = true;
    }

};
