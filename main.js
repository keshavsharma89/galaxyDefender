var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update, render: render });


function preload(){
    game.load.spritesheet('bullet', 'assets/rgblaser.png', 4, 4);
    game.load.image('enemyBullet', 'assets/enemy-bullet.png');
    game.load.image('spaceship', 'assets/spaceship.png');
    game.load.image('gamename', 'assets/galaxy_defenders.png');
    game.load.audio('loading_audio', 'assets/SoundEffects/music/loading.mp3');
    game.load.image('bulletS', 'assets/bulletS.png');
    game.load.image('bulletP', 'assets/bulletP.png');
    game.load.image('bulletX', 'assets/bulletX.png');
    game.load.image('powerupP', 'assets/powerUP1.png');
    game.load.image('powerupS', 'assets/powerUP2.png');
    game.load.image('powerupX', 'assets/powerUP3.png');
    game.load.image('invader', 'assets/shmup-baddie21.png');
    game.load.image('bigInvader', 'assets/bigB.png');
    game.load.image('ship', 'assets/ak46.png');
    game.load.spritesheet('kaboom', 'assets/explode.png', 128, 128);
    game.load.image('starfield', 'assets/starfield1.png');
    game.load.image('won', 'assets/won.png');
    game.load.image('gameOver', 'assets/gameover.gif');
    game.load.audio('blast', 'assets/SoundEffects/orangeshell.ogg');
    game.load.audio('playerDeath', 'assets/SoundEffects/menu_select.mp3');
    game.load.audio('powerGain', 'assets/SoundEffects/pickup.wav');
    game.load.audio('powerDown', 'assets/SoundEffects/powerdown.ogg');
    game.load.audio('bgm1', 'assets/SoundEffects/music/bgm1.mp3');
    game.load.audio('gameOverAudio', 'assets/SoundEffects/go.mp3');
    game.load.audio('bgm2', 'assets/SoundEffects/music/bgm2.mp3');
}


var bulletTime = 0;
var score = 0;
var scoreString = '';
var playerLife = 85;
var firingTimer = 0;
var livingEnemies = [];
var haltGamePlay = false;

var player, aliens, weapon, cursors, fireButton, explosions, starfield, scoreText, powerLevelText, enemyBullet, stateText, powerupS, powerupP, powerupX, blaster, playerDeath, powerGain, powerDown, bgm1, bgm2, gamename, spaceship, won, gameOver, gameOverAudio;

function create(){
  //game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;
  //game.scale.startFullScreen(false);

  bgmusic = game.add.audio('loading_audio');
  bgmusic.play();

  starfield = game.add.tileSprite(0, 0, 800, 600, 'starfield');

  spaceship = game.add.sprite(150,550, 'spaceship');
  game.physics.enable(spaceship, Phaser.Physics.ARCADE);
  gamename = game.add.sprite(10,1000, 'gamename');
  game.physics.enable(gamename, Phaser.Physics.ARCADE);

  game.input.onDown.addOnce(startGame, this);
}

function update(){
  //  Scroll the background
  starfield.tilePosition.y += 2;
  spaceship.body.velocity.y -= 0.1;
  if( gamename.y < 180 ){
    gamename.body.velocity.y = 0;
  }else{
    gamename.body.velocity.y -= 0.1;
  }
    if (typeof player !== 'undefined') {
      if (player.alive){
          handleShipEvents();

          //  Firing?
          if (fireButton.isDown){
              weapon.fire();
          }

          if (game.time.now > firingTimer){
              enemyFires();
          }

          //  Run collision
          game.physics.arcade.collide(weapon.bullets, aliens, collisionHandler)
          game.physics.arcade.overlap(weapon.bullets, enemyBullets, collisionHandler, null, this);
          game.physics.arcade.overlap(enemyBullets, player, enemyHitsPlayer, null, this);
          game.physics.arcade.overlap(powerupS, player, powerCollisionHandlerS, null, this);
          game.physics.arcade.overlap(powerupP, player, powerCollisionHandlerP, null, this);
          game.physics.arcade.overlap(powerupX, player, powerCollisionHandlerX, null, this);
          game.physics.arcade.overlap(aliens, player, enemyPlayerCollision, null, this);
      }
    }
}

function render() {}

function startGame(){
    game.world.setBounds(0, 0, 800, 600);
    game.physics.startSystem(Phaser.Physics.ARCADE);

    spaceship.kill();
    gamename.kill();
    bgmusic.stop();

    // added audio
    blaster = game.add.sound('blast', 0.3);
    playerDeath = game.add.audio('playerDeath');
    powerGain = game.add.audio('powerGain');
    powerDown = game.add.audio('powerDown');
    gameOverAudio = game.add.audio('gameOverAudio', 20.0);
    bgm1 = game.add.audio('bgm1');
    bgm1.loopFull();

    //  The player ship
    player = game.add.sprite(400, 500, 'ship');
    createShip();

    won = game.add.sprite(120, 200, 'won');
    game.physics.enable(won, Phaser.Physics.ARCADE);
    won.visible = false;

    gameOver = game.add.sprite(15, 200, 'gameOver');
    game.physics.enable(gameOver, Phaser.Physics.ARCADE);
    gameOver.visible = false;
    // weapon as bullets
    //  Creates 30 bullets, using the 'bullet' graphic
    weapon = game.add.weapon(40, 'bullet');
    createWeapon();

    // The enemy's bullets
    enemyBullets = game.add.group();
    enemyBullets.enableBody = true;
    enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
    if(!haltGamePlay){
      enemyBullets.createMultiple(30, 'enemyBullet');
      enemyBullets.setAll('anchor.x', 0.5);
      enemyBullets.setAll('anchor.y', 1);
    }

    enemyBullets.setAll('outOfBoundsKill', true);
    enemyBullets.setAll('checkWorldBounds', true);

    //  The score
    scoreString = 'Score : ';
    scoreText = game.add.text(10, 20, scoreString + score, { font: '34px Arial', fill: '#fff' });
    powerLevelText=game.add.text(1, 565, '', { font: '34px Arial', fill: '#f00' });
    renderPowerLevel();

    //  Text
    stateText = game.add.text(game.world.centerX, 450,'Click to start alien attack!!', { font: '30px Arial', fill: '#fff' });
    stateText.anchor.setTo(0.5, 0.5);
    stateText.visible = true;

    //  An explosion pool
    explosions = game.add.group();
    explosions.createMultiple(30, 'kaboom');
    explosions.forEach(setupInvader, this);

    //  And some controls to play the game with
    cursors = game.input.keyboard.createCursorKeys();
    fireButton = game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);

    aliens = game.add.group();
    aliens.enableBody = true;
    aliens.physicsBodyType = Phaser.Physics.ARCADE;

    powerupS = game.add.group();
    powerupS.enableBody = true;
    game.time.events.repeat(Phaser.Timer.SECOND * 5 , 10, addPowerupS, this);

    powerupP = game.add.group();
    powerupP.enableBody = true;
    game.time.events.repeat(Phaser.Timer.SECOND * 10 , 10, addPowerupP, this);

    powerupX = game.add.group();
    powerupX.enableBody = true;
    game.time.events.repeat(Phaser.Timer.SECOND * 15 , 10, addPowerupX, this);

    game.input.onDown.addOnce(addBaddies, this);
}


function addBaddies(){
  bgm1.stop();
  bgm2 = game.add.audio('bgm2');
  bgm2.loopFull();
  game.time.events.repeat(Phaser.Timer.SECOND * 5 , 10, createAliens, this);
  game.time.events.repeat(Phaser.Timer.SECOND * 10 , 3, createBigAliens, this);

  weapon = game.add.weapon(40, 'bullet');
  createWeapon();

  stateText.visible = false;
}

function addPowerupS(){
  if(!haltGamePlay){
    var s = powerupS.create(game.world.randomX, 0, 'powerupS');
    s.name = 'alien' + s;
    s.body.collideWorldBounds = false;
    s.body.bounce.setTo(0.8, 0.8);
    s.body.velocity.y = game.rnd.between(25, 100);
    s.events.onOutOfBounds.add(killPowerUp, this);
  }
}
function addPowerupP(){
  if(!haltGamePlay){
    var s = powerupP.create(game.world.randomX, 0, 'powerupP');
    s.name = 'alien' + s;
    s.body.collideWorldBounds = false;
    s.body.bounce.setTo(0.8, 0.8);
    s.body.velocity.y = game.rnd.between(25, 100);
    s.events.onOutOfBounds.add(killPowerUp, this);
  }
}
function addPowerupX(){
  if(!haltGamePlay){
    var s = powerupX.create(game.world.randomX, 0, 'powerupX');
    s.name = 'alien' + s;
    s.body.collideWorldBounds = false;
    s.body.bounce.setTo(0.8, 0.8);
    s.body.velocity.y = game.rnd.between(25, 100);
    s.events.onOutOfBounds.add(killPowerUp, this);
  }
}

function killPowerUp(p) {
  p.kill();
}

function setupInvader (invader) {
  invader.anchor.x = 0.5;
  invader.anchor.y = 0.5;
  invader.animations.add('kaboom');
}

function descend() {
  aliens.y += 10;
}


function renderPowerLevel(){
  powerLevel='';
  for(i=0; i<playerLife ; i++){
    powerLevel +='I'
  }
  powerLevelText.text = powerLevel;
  if(playerLife<20){
    powerLevelText.style.fill = '#FF0000';
  }else if (playerLife<50) {
    powerLevelText.style.fill = '#e1c102';
  }else {
    powerLevelText.style.fill = '#00FF00';
  }
}

function collisionHandler (bullet, alien){
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

    if (aliens.countLiving() == 0){
        score += 1000;
        scoreText.text = scoreString + score;

        killEverything();


        won.visible = true;

        //the "click to restart" handler
        game.input.onTap.addOnce(restart,this);
    }
}



function killEverything() {
  enemyBullets.callAll('kill');
  aliens.callAll('kill');
  powerupP.callAll('kill');
  powerupS.callAll('kill');
  powerupX.callAll('kill');
  haltGamePlay = true;
}
function enemyPlayerCollision(player, enemy) {
  enemy.kill();

  playerLife -= 10
  renderPowerLevel()

  //  And create an explosion :)
  var explosion = explosions.getFirstExists(false);
  explosion.reset(player.body.x, player.body.y);
  explosion.play('kaboom', 30, false, true);

  isPlayerDead(player);
}


function powerCollisionHandlerS (player, powerUp) {
    //  When a powerUp hits player we change bullet
    powerUp.kill();
    powerGain.play();

    weapon = game.add.weapon(40, 'bulletS');
    createWeapon();
}
function powerCollisionHandlerP (player, powerUp) {
    //  When a powerUp hits player we change bullet
    powerUp.kill();
    powerGain.play();

    weapon = game.add.weapon(40, 'bulletP');
    createWeapon();
}
function powerCollisionHandlerX (player, powerUp) {
    //  When a powerUp hits player we change bullet
    powerUp.kill();
    powerGain.play();

    weapon = game.add.weapon(40, 'bulletX');
    createWeapon();
}

function enemyHitsPlayer (player,bullet) {
    bullet.kill();
    playerLife -= 20
    renderPowerLevel()

    //  And create an explosion :)
    var explosion = explosions.getFirstExists(false);
    explosion.reset(player.body.x, player.body.y);
    explosion.play('kaboom', 30, false, true);

    isPlayerDead(player);
}

function isPlayerDead(player){
  // When the player dies
  if (playerLife < 1){
      playerDeath.play();

      player.kill();
      enemyBullets.callAll('kill');
      aliens.callAll('kill');

      stateText.text="Click to restart";
      stateText.visible = true;

      gameOver.visible = true;
      killEverything()
      gameOverAudio.play();


      //the "click to restart" handler
      game.input.onTap.addOnce(restart,this);
  }else{
    powerDown.play();
  }
}

function enemyFires () {
    //  Grab the first bullet we can from the pool
    enemyBullet = enemyBullets.getFirstExists(false);
    livingEnemies.length=0;

    // put every living enemy in an array
    aliens.forEachAlive(function(alien){ livingEnemies.push(alien); });

    if (enemyBullet && livingEnemies.length > 0){
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

function restart(){
    //resets the life count
    playerLife=85;
    renderPowerLevel();
    haltGamePlay = false;

    //revives the player
    player.revive();

    //  And brings the aliens back from the dead :)
    aliens.removeAll();
    createAliens();
    createBigAliens();

    //hides the text
    won.visible = false;
    gameOver.visible = false;
    stateText.visible = false;
}
