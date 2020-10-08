Sprite_Destination.prototype.updatePosition = function () {
  const tileWidth = $gameMap.tileWidth();
  const tileHeight = $gameMap.tileHeight();
  const x = $gameTemp.destinationPX();
  const y = $gameTemp.destinationPY();
  this.x = $gameMap.adjustPX(x);
  this.y = $gameMap.adjustPY(y);
};
