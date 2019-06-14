function createAliens(){
  for (var x = 0; x < 10; x++){
    var alien = aliens.create(game.world.randomX, 0, 'invader');
    game.physics.arcade.enable(alien);
    alien.body.velocity.y = game.rnd.between(25, 100);
    alien.autoCull = true;
    alien.checkWorldBounds = true;
    alien.events.onOutOfBounds.add(resetSprite, this);
  }
}

function createBigAliens(){
  if (aliens.countLiving() != 0){
    for (var x = 0; x < 5; x++){
      var alien = aliens.create(game.world.randomX, 0, 'bigInvader');
      game.physics.arcade.enable(alien);
      alien.body.velocity.y = game.rnd.between(25, 100);
      alien.autoCull = true;
      alien.checkWorldBounds = true;
      alien.events.onOutOfBounds.add(resetSprite, this);
    }
  }
}

function resetSprite(sprite){
  sprite.y = 0;
}
