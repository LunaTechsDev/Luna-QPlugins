import ColliderManager from "../ColliderManager";
import QMovement from "../QMovement";

Input.keyMapper[121] = "f10";

const Alias_Scene_Map_updateMain = Scene_Map.prototype.updateMain;
Scene_Map.prototype.updateMain = function () {
  Alias_Scene_Map_updateMain.call(this);
  const key = typeof QInput !== "undefined" ? "#f10" : "f10";
  if ($gameTemp.isPlaytest() && Input.isTriggered(key)) {
    ColliderManager.toggle();
  }
  ColliderManager.update();
};

const Alias_Scene_Map_terminate = Scene_Map.prototype.terminate;
Scene_Map.prototype.terminate = function () {
  this._spriteset.removeChild(ColliderManager.container);
  Alias_Scene_Map_terminate.call(this);
};

Scene_Map.prototype.processMapTouch = function () {
  if (TouchInput.isTriggered() || this._touchCount > 0) {
    if (TouchInput.isPressed()) {
      if (this._touchCount === 0 || this._touchCount >= 20) {
        let x = $gameMap.canvasToMapPX(TouchInput.x);
        let y = $gameMap.canvasToMapPY(TouchInput.y);
        if (!$gameMap.offGrid()) {
          const ox = x % QMovement.tileSize;
          const oy = y % QMovement.tileSize;
          x += QMovement.tileSize / 2 - ox;
          y += QMovement.tileSize / 2 - oy;
        }
        $gameTemp.setPixelDestination(x, y);
      }
      this._touchCount++;
    } else {
      this._touchCount = 0;
    }
  }
};

Scene_Map.prototype.updateCallMenu = function () {
  if (this.isMenuEnabled()) {
    if (this.isMenuCalled()) {
      this.menuCalling = true;
    }
    if (this.menuCalling && !$gamePlayer.startedMoving()) {
      this.callMenu();
    }
  } else {
    this.menuCalling = false;
  }
};
