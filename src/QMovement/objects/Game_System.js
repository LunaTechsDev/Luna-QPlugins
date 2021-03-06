import ColliderManager from "../ColliderManager";

const Alias_Game_System_onBeforeSave = Game_System.prototype.onBeforeSave;
Game_System.prototype.onBeforeSave = function () {
  Alias_Game_System_onBeforeSave.call(this);
  $gameMap.clearColliders();
  ColliderManager._needsRefresh = true;
};

const Alias_Game_System_onAfterLoad = Game_System.prototype.onAfterLoad;
Game_System.prototype.onAfterLoad = function () {
  Alias_Game_System_onAfterLoad.call(this);
  ColliderManager._needsRefresh = true;
};
