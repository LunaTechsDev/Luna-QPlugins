var Alias_Game_Temp_initialize = Game_Temp.prototype.initialize;
Game_Temp.prototype.initialize = function () {
  Alias_Game_Temp_initialize.call(this);
  this._destinationPX = null;
  this._destinationPY = null;
};

Game_Temp.prototype.setPixelDestination = function (x, y) {
  this._destinationPX = x;
  this._destinationPY = y;
  var x1 = $gameMap.roundX(Math.floor(x / $gameMap.tileWidth()));
  var y1 = $gameMap.roundY(Math.floor(y / $gameMap.tileHeight()));
  this.setDestination(x1, y1);
};

var Alias_Game_Temp_clearDestination = Game_Temp.prototype.clearDestination;
Game_Temp.prototype.clearDestination = function () {
  if ($gamePlayer._movingWithMouse) return;
  Alias_Game_Temp_clearDestination.call(this);
  this._destinationPX = null;
  this._destinationPY = null;
};

Game_Temp.prototype.destinationPX = function () {
  return this._destinationPX;
};

Game_Temp.prototype.destinationPY = function () {
  return this._destinationPY;
};
