
var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update, render: render });

function preload() {

    game.load.spritesheet('bullet', 'assets/rgblaser.png', 4, 4);
    game.load.image('enemyBullet', 'assets/enemy-bullet.png');
    game.load.image('bullet195', 'assets/bullet195.png');
    game.load.spritesheet('invader', 'assets/invader32x32x4.png', 32, 32);
    game.load.image('ship', 'assets/thrust_ship.png');
    game.load.spritesheet('kaboom', 'assets/explode.png', 128, 128);
    game.load.image('starfield', 'assets/starfield.jpg');
    game.load.image('background', 'assets/background2.png');
    game.load.image('powerup', 'assets/bullet56.png');
    game.load.audio('blast', 'assets/SoundEffects/blaster.mp3');
    game.load.audio('playerDeath', 'assets/SoundEffects/menu_select.mp3');
    game.load.audio('powerGain', 'assets/SoundEffects/pickup.WAV');

}

var player;
var aliens;
var weapon;
var bulletTime = 0;
var cursors;
var fireButton;
var explosions;
var starfield;
var score = 0;
var scoreString = '';
var scoreText;
var lives;
var enemyBullet;
var firingTimer = 0;
var stateText;
var livingEnemies = [];
var powerUps;
var blaster;
var playerDeath;
var powerGain;

function create() {

    game.world.setBounds(0, 0, 800, 600);

    game.physics.startSystem(Phaser.Physics.ARCADE);

    //  The scrolling starfield background
    starfield = game.add.tileSprite(0, 0, 800, 600, 'starfield');
    // added audio

    blaster = game.add.audio('blast');
    playerDeath = game.add.audio('playerDeath');
    powerGain = game.add.audio('powerGain');

    //  The player ship
    player = game.add.sprite(400, 500, 'ship');
    createShip();

    // weapon as bullets
    //  Creates 30 bullets, using the 'bullet' graphic
    weapon = game.add.weapon(40, 'bullet');
    createWeapon();



    // The enemy's bullets
    enemyBullets = game.add.group();
    enemyBullets.enableBody = true;
    enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
    enemyBullets.createMultiple(30, 'enemyBullet');
    enemyBullets.setAll('anchor.x', 0.5);
    enemyBullets.setAll('anchor.y', 1);
    enemyBullets.setAll('outOfBoundsKill', true);
    enemyBullets.setAll('checkWorldBounds', true);


    //  The baddies!
    aliens = game.add.group();
    aliens.enableBody = true;
    aliens.physicsBodyType = Phaser.Physics.ARCADE;

    game.time.events.repeat(Phaser.Timer.SECOND * 2 , 10, createAliens, this);


    powerUps = addPowerUp(game);
    //  The score
    scoreString = 'Score : ';
    scoreText = game.add.text(10, 10, scoreString + score, { font: '34px Arial', fill: '#fff' });

    //  Lives
    lives = game.add.group();
    // game.add.text(game.world.width - 100, 10, 'Lives : ', { font: '34px Arial', fill: '#fff' });

    //  Text
    stateText = game.add.text(game.world.centerX,game.world.centerY,' ', { font: '84px Arial', fill: '#fff' });
    stateText.anchor.setTo(0.5, 0.5);
    stateText.visible = false;

    // for (var i = 0; i < 3; i++)
    // {
    //     var ship = lives.create(game.world.width - 100 + (30 * i), 60, 'ship');
    //     ship.anchor.setTo(0.5, 0.5);
    //     ship.angle = 90;
    //     ship.alpha = 0.4;
    // }

    //  An explosion pool
    explosions = game.add.group();
    explosions.createMultiple(30, 'kaboom');
    explosions.forEach(setupInvader, this);

    //  And some controls to play the game with
    cursors = game.input.keyboard.createCursorKeys();
    fireButton = game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);

}

function addPowerUp(game)
{

  power_ups = game.add.group();
   power_ups.enableBody = true;

   for (var i = 0; i < 5; i++)
   {
       var s = power_ups.create(game.world.randomX, game.world.randomY, 'powerup');
       s.name = 'alien' + s;
       s.body.collideWorldBounds = true;
       s.body.bounce.setTo(0.8, 0.8);
       s.body.velocity.setTo(10 + Math.random() * 40, 10 + Math.random() * 40);
   }

   return power_ups;
}

function setupInvader (invader) {

    invader.anchor.x = 0.5;
    invader.anchor.y = 0.5;
    invader.animations.add('kaboom');

}

function descend() {

    aliens.y += 10;

}

function update() {

    //  Scroll the background
    starfield.tilePosition.y += 2;

    if (player.alive)
    {
        handleShipEvents();

        //  Firing?
        if (fireButton.isDown)
        {
            weapon.fire();
            blaster.play();
        }

        if (game.time.now > firingTimer)
        {
            enemyFires();
        }

        //  Run collision

        game.physics.arcade.collide(weapon.bullets, aliens, collisionHandler)
        game.physics.arcade.overlap(weapon.bullets, enemyBullets, collisionHandler, null, this);
        game.physics.arcade.overlap(enemyBullets, player, enemyHitsPlayer, null, this);
        game.physics.arcade.overlap(powerUps, player, powerCollisionHandler, null, this);
        game.physics.arcade.overlap(aliens, player, enemyPlayerCollision, null, this);


    }

}

function render() {

    // for (var i = 0; i < aliens.length; i++)
    // {
    //     game.debug.body(aliens.children[i]);
    // }

}




function collisionHandler (bullet, alien) {

    //  When a bullet hits an alien we kill them both
    bullet.kill();
    alien.kill();

    //  Increase the score
    score += 20;
    scoreText.text = scoreString + score;

    //  And create an explosion :)
    var explosion = explosions.getFirstExists(false);
    explosion.reset(alien.body.x, alien.body.y);
    explosion.play('kaboom', 30, false, true);

    if (aliens.countLiving() == 0)
    {
        score += 1000;
        scoreText.text = scoreString + score;

        enemyBullets.callAll('kill',this);
        stateText.text = " You Won, \n Click to restart";
        stateText.visible = true;

        //the "click to restart" handler
        game.input.onTap.addOnce(restart,this);
    }

}



function enemyPlayerCollision(player, enemy) {
  enemy.kill();
}


function powerCollisionHandler (player, powerUp) {

    //  When a powerUp hits player we change bullet
    powerUp.kill();
    powerGain.play();

    weapon = game.add.weapon(40, 'bullet195');
    createWeapon();
}

function enemyHitsPlayer (player,bullet) {

    bullet.kill();

    live = lives.getFirstAlive();

    if (live)
    {
        live.kill();
    }

    //  And create an explosion :)
    var explosion = explosions.getFirstExists(false);
    explosion.reset(player.body.x, player.body.y);
    explosion.play('kaboom', 30, false, true);

    // When the player dies
    if (lives.countLiving() < 1)
    {
        player.kill();
        playerDeath.play();
        enemyBullets.callAll('kill');

        stateText.text=" GAME OVER \n Click to restart";
        stateText.visible = true;

        //the "click to restart" handler
        game.input.onTap.addOnce(restart,this);
    }

}

function enemyFires () {

    //  Grab the first bullet we can from the pool
    enemyBullet = enemyBullets.getFirstExists(false);

    livingEnemies.length=0;

    aliens.forEachAlive(function(alien){

        // put every living enemy in an array
        livingEnemies.push(alien);
    });


    if (enemyBullet && livingEnemies.length > 0)
    {

        var random=game.rnd.integerInRange(0,livingEnemies.length-1);

        // randomly select one of them
        var shooter=livingEnemies[random];
        // And fire the bullet from this enemy
        enemyBullet.reset(shooter.body.x, shooter.body.y);

        game.physics.arcade.moveToObject(enemyBullet,player,120);
        firingTimer = game.time.now + 2000;
    }

}


function resetBullet (bullet) {

    //  Called if the bullet goes out of the screen
    bullet.kill();

}

function restart () {

    //  A new level starts

    //resets the life count
    lives.callAll('revive');
    //  And brings the aliens back from the dead :)
    aliens.removeAll();
    createAliens();

    //revives the player
    player.revive();
    //hides the text
    stateText.visible = false;

}
