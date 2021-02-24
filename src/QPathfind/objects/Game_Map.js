import QPathfind from '../QPathfind'

var Alias_Game_Map_update = Game_Map.prototype.update;
Game_Map.prototype.update = function (sceneActive) {
  Alias_Game_Map_update.call(this, sceneActive);
  if (QPathfind._needsUncompress) {
    this.uncompressPathfinders();
    QPathfind._needsUncompress = false;
  }
};

Game_Map.prototype.compressPathfinders = function () {
  for (var i = 0; i < this.events().length; i++) {
    var event = this.events()[i];
    if (event._pathfind) {
      event._compressedPathfind = event._pathfind.compress();
      event.clearPathfind();
    }
  }
  if ($gamePlayer._pathfind) {
    $gamePlayer._compressedPathfind = $gamePlayer._pathfind.compress();
    $gamePlayer.clearPathfind();
  }
};

Game_Map.prototype.uncompressPathfinders = function () {
  for (var i = 0; i < this.events().length; i++) {
    var event = this.events()[i];
    if (event._compressedPathfind) {
      var old = event._compressedPathfind;
      event.initPathfind(old.x, old.y, old.options);
      delete event._compressedPathfind;
    }
  }
  if ($gamePlayer._compressedPathfind) {
    var old = $gamePlayer._compressedPathfind;
    $gamePlayer.initPathfind(old.x, old.y, old.options);
    delete $gamePlayer._compressedPathfind;
  }
};
