/*
 * Button to be pressed by player in game.  
 * If main character touches it then it either opens the exit door or releases enemies based on it being the fake or real button
 */
function Button(game, position, target, door, isRealButton, buttonImage, correctButtonImage, wrongButtonImage) {

    // First call the parent constructor
    Phaser.Sprite.call(this, game, position.x, position.y, buttonImage);

    // Add sprite to game
    game.add.existing(this);
    
    this.correctButtonImage = correctButtonImage;
    this.wrongButtonImage = wrongButtonImage;
    
    // Set the game variable for update
    this.game = game;
    
    // Set the exit door
    this.exitDoor = door;
    
    // Set if it is the real button or not
    this.isRealButton = isRealButton;
    
    // Boolean used to release monsteres if fake button pressed
    this.isReleaseMonsters = false;

    
    // Assign target that the object follows
    this.target = target;

    // Enable physics for dis sprite
    game.physics.enable(this, Phaser.Physics.ARCADE);
    
    // Set collide world bounds to true
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

    // If it is the real button
    if(this.isRealButton)
    {
        // Open the exit door
        this.exitDoor.isDoorOpen = true;
        
        // Change the button texture to the correctButtonImage
        this.loadTexture(this.correctButtonImage);
    }
    // If it is not the real button
    else
    {
        // Unlease da enemies
        this.isReleaseMonsters = true;
        
        // Chance the button texture to the wrongButtonImage
        this.loadTexture(this.wrongButtonImage);
    }


};
