import { _PARAMS } from '../QPathfind'

if (typeof QMovement !== "undefined") {
  const Alias_Scene_Map_updateDestination = Scene_Map.prototype.updateDestination;
  Scene_Map.prototype.updateDestination = function () {
    Alias_Scene_Map_updateDestination.call(this);
    if (!this.isMapTouchOk()) {
      $gamePlayer.clearMouseMove();
    }
  };

  const Alias_Game_Player_requestMouseMove =
    Game_Player.prototype.requestMouseMove;
  Game_Player.prototype.requestMouseMove = function () {
    if (this._pathfind && !this._pathfind._completed) {
      this._requestMouseMove = false;
      return;
    }
    Alias_Game_Player_requestMouseMove.call(this);
  };

  const Alias_Game_Player_moveByMouse = Game_Player.prototype.moveByMouse;
  Game_Player.prototype.moveByMouse = function (x, y) {
    if (!Alias_Game_Player_moveByMouse.call(this, x, y)) {
      return false;
    }
    const half = QMovement.tileSize / 2;
    const x2 = x - half;
    const y2 = y - half;
    const dx = Math.abs(this._px - x2);
    const dy = Math.abs(this._py - y2);
    if (dx + dy < this.optTiles()) {
      this.clearMouseMove();
      return false;
    }
    this.initPathfind(x2, y2, {
      smart: 2,
      earlyEnd: true,
      breakable: true,
      adjustEnd: true,
    });
    $gameTemp.setPixelDestination(x, y);
    return true;
  };

  const Alias_Game_Player_clearMouseMove = Game_Player.prototype.clearMouseMove;
  Game_Player.prototype.clearMouseMove = function () {
    if (this._movingWithMouse && this._isPathfinding) this.clearPathfind();
    Alias_Game_Player_clearMouseMove.call(this);
  };

  Game_Player.prototype.onPathfindComplete = function () {
    Game_Character.prototype.onPathfindComplete.call(this);
    if (this._movingWithMouse) {
      this.clearMouseMove();
    }
  };
}

if (!_PARAMS._DASHONMOUSE) {
  Game_Player.prototype.updateDashing = function () {
    if (
      typeof QMovement !== "undefined" ? this.startedMoving() : this.isMoving()
    ) {
      return;
    }
    if (this.canMove() && !this.isInVehicle() && !$gameMap.isDashDisabled()) {
      this._dashing = this.isDashButtonPressed();
    } else {
      this._dashing = false;
    }
  };
}
