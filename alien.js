function createAliens(){
  for (var x = 0; x < 20; x++){
    var alien = aliens.create(game.world.randomX, 0, 'invader');
    game.physics.arcade.enable(alien);
    alien.body.velocity.y = game.rnd.between(25, 100);
    alien.autoCull = true;
    alien.checkWorldBounds = true;
    alien.events.onOutOfBounds.add(resetSprite, this);
  }
}

function resetSprite(sprite){
  sprite.y = 0;
}
