import { _CMFOLDER } from "./constants";

const ColliderManager = QMovement.ColliderManager;

ColliderManager.collisionMap = new Sprite();
ColliderManager.collisionMap.bitmap = new Bitmap();

const Alias_ColliderManager_clear = ColliderManager.clear;
ColliderManager.clear = function () {
  Alias_ColliderManager_clear.call(this);
  this.clearCollisionMap();
  this.container.addChild(this.collisionMap);
};

ColliderManager.setCollisionMap = function (collisionMap) {
  ColliderManager.collisionMap.bitmap = ImageManager.loadBitmap(
    _CMFOLDER,
    collisionMap
  );
};

ColliderManager.clearCollisionMap = function () {
  ColliderManager.collisionMap.bitmap = new Bitmap();
};

const Alias_ColliderManager_update = ColliderManager.update;
ColliderManager.update = function () {
  Alias_ColliderManager_update.call(this);
  this.updateCollisionMap();
};

ColliderManager.updateCollisionMap = function () {
  this.collisionMap.x = -$gameMap.displayX() * $gameMap.tileWidth();
  this.collisionMap.y = -$gameMap.displayY() * $gameMap.tileHeight();
};
