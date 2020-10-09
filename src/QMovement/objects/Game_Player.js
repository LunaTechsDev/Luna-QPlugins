import ColliderManager from "../ColliderManager";

const Alias_Game_Player_initMembers = Game_Player.prototype.initMembers;
Game_Player.prototype.initMembers = function () {
  Alias_Game_Player_initMembers.call(this);
  this._lastMouseRequested = 0;
  this._requestMouseMove = false;
  this._movingWithMouse = false;
  this._smartMove = QMovement.smartMove;
};

Game_Player.prototype.defaultColliderConfig = function () {
  return QMovement.playerCollider;
};

const Alias_Game_Player_refresh = Game_Player.prototype.refresh;
Game_Player.prototype.refresh = function () {
  this.reloadColliders();
  Alias_Game_Player_refresh.call(this);
};

Game_Player.prototype.requestMouseMove = function () {
  const currFrame = Graphics.frameCount;
  const dt = currFrame - this._lastMouseRequested;
  if (dt >= 5) {
    this._lastMouseRequested = currFrame;
    this._requestMouseMove = true;
  } else {
    this._requestMouseMove = false;
  }
};

Game_Player.prototype.moveByMouse = function (x, y) {
  if (this.triggerTouchAction()) {
    this.clearMouseMove();
    return false;
  }
  this._movingWithMouse = true;
  return true;
};

Game_Player.prototype.clearMouseMove = function () {
  this._requestMouseMove = false;
  this._movingWithMouse = false;
  $gameTemp.clearDestination();
};

Game_Player.prototype.moveByInput = function () {
  if (!this.startedMoving() && this.canMove()) {
    if (this.triggerAction()) return;
    const direction = QMovement.diagonal ? Input.dir8 : Input.dir4;
    if (direction > 0) {
      this.clearMouseMove();
    } else if ($gameTemp.isDestinationValid()) {
      if (!QMovement.moveOnClick) {
        $gameTemp.clearDestination();
        return;
      }
      this.requestMouseMove();
      if (this._requestMouseMove) {
        const x = $gameTemp.destinationPX();
        const y = $gameTemp.destinationPY();
        return this.moveByMouse(x, y);
      }
    }
    if (
      typeof QInput !== "undefined" &&
      Input.preferGamepad() &&
      $gameMap.offGrid()
    ) {
      this.moveWithAnalog();
    } else {
      if ([4, 6].contains(direction)) {
        this.moveInputHorizontal(direction);
      } else if ([2, 8].contains(direction)) {
        this.moveInputVertical(direction);
      } else if ([1, 3, 7, 9].contains(direction) && QMovement.diagonal) {
        this.moveInputDiagonal(direction);
      }
    }
  }
};

Game_Player.prototype.moveInputHorizontal = function (dir) {
  this.moveStraight(dir);
};

Game_Player.prototype.moveInputVertical = function (dir) {
  this.moveStraight(dir);
};

Game_Player.prototype.moveInputDiagonal = function (dir) {
  const diag = {
    1: [4, 2],
    3: [6, 2],
    7: [4, 8],
    9: [6, 8],
  };
  this.moveDiagonally(diag[dir][0], diag[dir][1]);
};

Game_Player.prototype.moveWithAnalog = function () {
  const horz = Input._dirAxesA.x;
  const vert = Input._dirAxesA.y;
  if (horz === 0 && vert === 0) return;
  let radian = Math.atan2(vert, horz);
  radian += radian < 0 ? Math.PI * 2 : 0;
  this.moveRadian(radian);
};

Game_Player.prototype.update = function (sceneActive) {
  const lastScrolledX = this.scrolledX();
  const lastScrolledY = this.scrolledY();
  const wasMoving = this.isMoving();
  this.updateDashing();
  if (sceneActive) {
    this.moveByInput();
  }
  Game_Character.prototype.update.call(this);
  this.updateScroll(lastScrolledX, lastScrolledY);
  this.updateVehicle();
  if (!this.startedMoving()) this.updateNonmoving(wasMoving);
  this._followers.update();
};

Game_Player.prototype.updateNonmoving = function (wasMoving) {
  if (!$gameMap.isEventRunning()) {
    if (wasMoving) {
      if (this._freqCount >= this.freqThreshold()) {
        $gameParty.onPlayerWalk();
      }
      this.checkEventTriggerHere([1, 2]);
      if ($gameMap.setupStartingEvent()) return;
    }
    if (this.triggerAction()) return;
    if (wasMoving) {
      if (this._freqCount >= this.freqThreshold()) {
        this.updateEncounterCount();
        this._freqCount = 0;
      }
    } else if (!this.isMoving() && !this._movingWithMouse) {
      $gameTemp.clearDestination();
    }
  }
};

Game_Player.prototype.updateDashing = function () {
  if (this.startedMoving()) return;
  if (this.canMove() && !this.isInVehicle() && !$gameMap.isDashDisabled()) {
    this._dashing =
      this.isDashButtonPressed() || $gameTemp.isDestinationValid();
  } else {
    this._dashing = false;
  }
};

Game_Player.prototype.startMapEvent = function (x, y, triggers, normal) {
  if (!$gameMap.isEventRunning()) {
    const collider = this.collider("interaction");
    const x1 = this._px;
    const y1 = this._py;
    collider.moveTo(x, y);
    let events = ColliderManager.getCharactersNear(
      collider,
      function (chara) {
        return this.collidesWithEvent(chara, "interaction");
      }.bind(this)
    );
    collider.moveTo(x1, y1);
    if (events.length === 0) {
      events = null;
      return;
    }
    const cx = this.cx();
    const cy = this.cy();
    events.sort(function (a, b) {
      return a.pixelDistanceFrom(cx, cy) - b.pixelDistanceFrom(cx, cy);
    });
    let event = events.shift();
    while (true) {
      if (event.isTriggerIn(triggers) && event.isNormalPriority() === normal) {
        event.start();
      }
      if (events.length === 0 || $gameMap.isAnyEventStarting()) {
        break;
      }
      event = events.shift();
    }
    events = null;
  }
};

Game_Player.prototype.collidesWithEvent = function (event, type) {
  if (event.constructor === Game_Event && !event._erased) {
    return event.collider("interaction").intersects(this.collider(type));
  }
  return false;
};

Game_Player.prototype.checkEventTriggerHere = function (triggers) {
  if (this.canStartLocalEvents()) {
    this.startMapEvent(
      this.collider("interaction").x,
      this.collider("interaction").y,
      triggers,
      false
    );
  }
};

Game_Player.prototype.checkEventTriggerThere = function (triggers, x2, y2) {
  if (this.canStartLocalEvents()) {
    const direction = this.direction();
    const x1 = this.collider("interaction").x;
    const y1 = this.collider("interaction").y;
    x2 = x2 || $gameMap.roundPXWithDirection(x1, direction, this.moveTiles());
    y2 = y2 || $gameMap.roundPYWithDirection(y1, direction, this.moveTiles());
    this.startMapEvent(x2, y2, triggers, true);
    if (!$gameMap.isAnyEventStarting()) {
      return this.checkCounter(triggers);
    }
  }
};

Game_Player.prototype.triggerTouchAction = function () {
  if ($gameTemp.isDestinationValid()) {
    const dist = this.pixelDistanceFrom(
      $gameTemp.destinationPX(),
      $gameTemp.destinationPY()
    );
    if (dist <= QMovement.tileSize * 1.5) {
      const dx = $gameTemp.destinationPX() - this.cx();
      const dy = $gameTemp.destinationPY() - this.cy();
      if (
        Math.abs(dx) < this.moveTiles() / 2 &&
        Math.abs(dy) < this.moveTiles() / 2
      ) {
        return false;
      }
      let radian = Math.atan2(dy, dx);
      radian += radian < 0 ? 2 * Math.PI : 0;
      const dir = this.radianToDirection(radian, true);
      let horz = dir;
      let vert = dir;
      if ([1, 3, 7, 9].contains(dir)) {
        if (dir === 1 || dir === 7) horz = 4;
        if (dir === 1 || dir === 3) vert = 2;
        if (dir === 3 || dir === 9) horz = 6;
        if (dir === 7 || dir === 9) vert = 8;
      }
      const x1 = $gameMap.roundPXWithDirection(
        this._px,
        horz,
        this.moveTiles()
      );
      const y1 = $gameMap.roundPYWithDirection(
        this._py,
        vert,
        this.moveTiles()
      );
      this.startMapEvent(x1, y1, [0, 1, 2], true);
      if (!$gameMap.isAnyEventStarting()) {
        if (
          this.checkCounter(
            [0, 1, 2],
            $gameTemp.destinationPX(),
            $gameTemp.destinationPY()
          )
        ) {
          this.clearMouseMove();
          this.setDirection(dir);
          return true;
        }
      } else {
        this.clearMouseMove();
        this.setDirection(dir);
        return true;
      }
    }
  }
  return false;
};

Game_Player.prototype.checkCounter = function (triggers, x2, y2) {
  const direction = this.direction();
  const x1 = this._px;
  const y1 = this._py;
  x2 = x2 || $gameMap.roundPXWithDirection(x1, direction, this.moveTiles());
  y2 = y2 || $gameMap.roundPYWithDirection(y1, direction, this.moveTiles());
  const collider = this.collider("interaction");
  collider.moveTo(x2, y2);
  let counter;
  ColliderManager.getCollidersNear(collider, function (tile) {
    if (!tile.isTile) return false;
    if (tile.isCounter && tile.intersects(collider)) {
      counter = tile;
      return "break";
    }
    return false;
  });
  collider.moveTo(x1, y1);
  if (counter) {
    if ([4, 6].contains(direction)) {
      let dist = Math.abs(counter.center.x - collider.center.x);
      dist += collider.width;
    } else if ([8, 2].contains(direction)) {
      let dist = Math.abs(counter.center.y - collider.center.y);
      dist += collider.height;
    }
    const x3 = $gameMap.roundPXWithDirection(x1, direction, dist);
    const y3 = $gameMap.roundPYWithDirection(y1, direction, dist);
    return this.startMapEvent(x3, y3, triggers, true);
  }
  return false;
};

Game_Player.prototype.airshipHere = function () {
  // TODO
  return false;
};

Game_Player.prototype.shipBoatThere = function (x2, y2) {
  // TODO
  return false;
};

// TODO create follower support addon
Game_Player.prototype.moveStraight = function (d, dist) {
  Game_Character.prototype.moveStraight.call(this, d, dist);
};

Game_Player.prototype.moveDiagonally = function (horz, vert) {
  Game_Character.prototype.moveDiagonally.call(this, horz, vert);
};
