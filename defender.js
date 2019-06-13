function createShip () {
player = game.add.sprite(400, 500, 'ship');
player.anchor.setTo(0.5, 0.5);
game.physics.enable(player, Phaser.Physics.ARCADE);
player.body.collideWorldBounds = true;
player.body.bounce.set(0.8);
player.body.allowRotation = true;
player.body.immovable = true;
}

function handleShipEvents () {
  //  Reset the player, then check for movement keys
  player.body.velocity.setTo(0, 0);
  player.body.angularVelocity = 0;

  if (cursors.left.isDown)
  {
      player.body.angularVelocity = -200;
  }
  else if (cursors.right.isDown)
  {
      player.body.angularVelocity = -200;
  }

  if (cursors.up.isDown)
  {
      player.body.velocity.copyFrom(game.physics.arcade.velocityFromAngle(player.angle, 300));
  }
}
