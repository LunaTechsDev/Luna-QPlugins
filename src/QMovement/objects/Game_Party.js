Game_Party.prototype.steps = function () {
  return Math.floor(this._steps);
};

Game_Party.prototype.increaseSteps = function () {
  this._steps += $gamePlayer.moveTiles() / QMovement.tileSize;
};
