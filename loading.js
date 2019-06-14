
var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update });

function preload() {
    game.load.image('starfield', 'assets/starfield1.png');
    game.load.image('spaceship', 'assets/spaceship.png');
    game.load.image('gamename', 'assets/loading_game.png');
    game.load.audio('loading_audio', 'assets/SoundEffects/music/loading.mp3')
}

var starfield;
var gamename;
var spaceship;

function create() {
  bgmusic = game.add.audio('loading_audio');
  bgmusic.play();

  starfield = game.add.tileSprite(0, 0, 800, 600, 'starfield');
  spaceship = game.add.sprite(150,550, 'spaceship');

  game.physics.enable(spaceship, Phaser.Physics.ARCADE);
  gamename = game.add.sprite(120,1000, 'gamename');
  game.physics.enable(gamename, Phaser.Physics.ARCADE);
}

function update() {
    starfield.tilePosition.y += 2;
    spaceship.body.velocity.y -= 0.1;
    if ( gamename.y < 180 )
    {
      gamename.body.velocity.y = 0;
    }
    else
    {
      gamename.body.velocity.y -= 0.1;
    }
}
