//-----------------------------------------------------------------------------
// Game_System

const Alias_Game_System_onBeforeSave = Game_System.prototype.onBeforeSave;
Game_System.prototype.onBeforeSave = function () {
  Alias_Game_System_onBeforeSave.call(this);
  $gameMap.compressPathfinders();
  QPathfind._needsUncompress = true;
};

const Alias_Game_System_onAfterLoad = Game_System.prototype.onAfterLoad;
Game_System.prototype.onAfterLoad = function () {
  Alias_Game_System_onAfterLoad.call(this);
  QPathfind._needsUncompress = true;
};
