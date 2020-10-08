Sprite_Destination.prototype.updatePosition = function () {
  var tileWidth = $gameMap.tileWidth();
  var tileHeight = $gameMap.tileHeight();
  var x = $gameTemp.destinationPX();
  var y = $gameTemp.destinationPY();
  this.x = $gameMap.adjustPX(x);
  this.y = $gameMap.adjustPY(y);
};
