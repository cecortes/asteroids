//* Config object, contains all the game settings *//
var config = {
  type: Phaser.AUTO,
  width: 1200,
  height: 800,
  backgroundColor: "black",
  parent: "asteroids-game",
  physics: {
    default: "arcade",
    arcade: {
      debug: true,
      gravity: { y: 0 },
    },
  },
  scene: [
    {
      preload: preload,
      create: create,
      update: update,
      extend: {
        generateAsteroids: generateAsteroids,
        collisionVesselAsteroid: collisionVesselAsteroid,
        updateLifeText: updateLifeText,
      },
    },
  ],
};

//* Instance of the game *//
var game = new Phaser.Game(config);

//* Global variables *//
var nave;
var life = 3;
var score = 0;
var ammo = 10;
var cursorLeft, cursorRight, cursorUp, cursorDown, cursorSpace;
var velVessel = 500;
var asteroids;
var minAsteroids = 2;
var maxAsteroids = 6;
var accel = 5;
var timeShowAsteroids = 1600;
var lifeText;

//* Preload function: loads all the assets *//
function preload() {
  // Load the spaceship image
  this.load.image("vessel", "./../assets/vessel.png");

  // Load the asteroid sprite sheet
  this.load.spritesheet("asteroids", "./../assets/asteroid_sprite.png", {
    frameWidth: 96,
    frameHeight: 96,
  });
}

//* Create function: creates all the game objects *//
function create() {
  // Create the spaceship
  nave = this.physics.add.sprite(
    game.config.width / 2,
    game.config.height / 2,
    "vessel"
  );

  // Set life, score and ammo
  nave.life = life;
  nave.score = score;
  nave.ammo = ammo;

  // Create text to show the life
  lifeText = this.add
    .text(16, 16, "", {
      fontSize: "32px",
      fill: "#fff",
    })
    .setDepth(0.1);

  // Update the life text
  updateLifeText();

  // Create the asteroids group
  asteroids = this.physics.add.group({
    defaultKey: "asteroids",
    frame: 0,
    maxSize: 50,
  });

  // Add new event to generate asteroids
  this.time.addEvent({
    delay: timeShowAsteroids,
    loop: true,
    callback: () => {
      this.generateAsteroids();
    },
  });

  // Add collision between the spaceship and the asteroids
  this.physics.add.overlap(
    nave,
    asteroids,
    this.collisionVesselAsteroid,
    null,
    this
  );

  // Set the cursor keys
  cursorLeft = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
  cursorRight = this.input.keyboard.addKey(
    Phaser.Input.Keyboard.KeyCodes.RIGHT
  );
  cursorUp = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
  cursorDown = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
  cursorSpace = this.input.keyboard.addKey(
    Phaser.Input.Keyboard.KeyCodes.SPACE
  );
}

//* Update function: updates the game objects *//
function update() {
  // Add acceleration to the asteroids
  Phaser.Actions.IncY(asteroids.getChildren(), accel);

  // Check if the spaceship is out of the screen
  asteroids.children.iterate((asteroid) => {
    if (asteroid.y > game.config.height) {
      asteroids.killAndHide(asteroid);
    }
  });

  // Set velocity to the spaceship
  nave.setVelocity(0);

  // Move the spaceship with the cursor keys
  if (cursorLeft.isDown) {
    nave.setVelocityX(-velVessel);
  } else if (cursorRight.isDown) {
    nave.setVelocityX(velVessel);
  }

  if (cursorUp.isDown) {
    nave.setVelocityY(-velVessel);
  } else if (cursorDown.isDown) {
    nave.setVelocityY(velVessel);
  }

  // Shoot with the space key
  if (cursorSpace.isDown) {
    if (nave.ammo > 0) {
      nave.ammo--;
      console.log(nave.ammo);
    }
  }
}

//* Function to generate asteroids *//
function generateAsteroids() {
  // Create a random number of asteroids between minAsteroids and maxAsteroids
  var numAsteroids = Phaser.Math.Between(minAsteroids, maxAsteroids);

  // Create the asteroids
  for (let x = 0; x < numAsteroids; x++) {
    let asteroid = asteroids.get();

    if (asteroid) {
      asteroid.setActive(true);
      asteroid.setVisible(true);
      asteroid.setFrame(Phaser.Math.Between(0, 2));
      asteroid.y = -192;
      asteroid.x = Phaser.Math.Between(0, game.config.width);

      // Avoid overlapping
      this.physics.add.overlap(asteroid, asteroids, (asteroidOnCollision) => {
        asteroidOnCollision.x = Phaser.Math.Between(0, game.config.width);
      });
    }
  }
}

//* Function to check the collision between the spaceship and the asteroids *//
function collisionVesselAsteroid(vessel, asteroid) {
  // Check if the asteroid is setActive
  if (asteroid.active) {
    // Kill the asteroid
    asteroids.killAndHide(asteroid);
    asteroid.setActive(false);
    asteroid.setVisible(false);

    // Check if the vessel has life
    if (vessel.life > 0) {
      vessel.life--;
      updateLifeText();
    }
  }
}

//* Function to update life text *//
function updateLifeText() {
  lifeText.setText("Life: " + nave.life);
}
