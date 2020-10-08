var Alias_Game_Event_clearPageSettings = Game_Event.prototype.clearPageSettings;
Game_Event.prototype.clearPageSettings = function () {
  Alias_Game_Event_clearPageSettings.call(this);
  this._ignoreCharacters = [];
};

var Alias_Game_Event_setupPageSettings = Game_Event.prototype.setupPageSettings;
Game_Event.prototype.setupPageSettings = function () {
  Alias_Game_Event_setupPageSettings.call(this);
  this.reloadColliders();
  this.initialPosition();
  this._typeRandomDir = null;
  this._typeTowardPlayer = null;
  var notes = this.notes(true);
  var ignore = /<ignoreCharas:(.*?)>/i.exec(notes);
  this._ignoreCharacters = [];
  if (ignore) {
    this._ignoreCharacters = ignore[1].split(",").map(function (s) {
      return QPlus.charaIdToId(s);
    });
  }
};

Game_Event.prototype.initialPosition = function () {
  var ox = /<ox[=|:](-?[0-9]+)>/i.exec(this.comments(true)) || 0;
  var oy = /<oy[=|:](-?[0-9]+)>/i.exec(this.comments(true)) || 0;
  if (ox) ox = Number(ox[1]) || 0;
  if (oy) oy = Number(oy[1]) || 0;
  var nextOffset = new Point(ox, oy);
  if (this._initialOffset) {
    ox -= this._initialOffset.x;
    oy -= this._initialOffset.y;
  }
  this._initialOffset = nextOffset;
  this.setPixelPosition(this.px + ox, this.py + oy);
};

Game_Event.prototype.defaultColliderConfig = function () {
  return QMovement.eventCollider;
};

Game_Event.prototype.ignoreCharacters = function (type) {
  var ignores = Game_CharacterBase.prototype.ignoreCharacters.call(this, type);
  return ignores.concat(this._ignoreCharacters);
};

Game_Event.prototype.updateStop = function () {
  if (this._locked) {
    this._freqCount = this.freqThreshold();
    this.resetStopCount();
  }
  Game_Character.prototype.updateStop.call(this);
  if (!this.isMoveRouteForcing()) {
    this.updateSelfMovement();
  }
};

Game_Event.prototype.updateSelfMovement = function () {
  if (!this._locked && this.isNearTheScreen()) {
    if (this._freqCount < this.freqThreshold()) {
      switch (this._moveType) {
        case 1:
          this.moveTypeRandom();
          break;
        case 2:
          this.moveTypeTowardPlayer();
          break;
        case 3:
          this.moveTypeCustom();
          break;
      }
    } else if (this.checkStop(this.stopCountThreshold())) {
      this._freqCount = 0;
    }
  }
};

// TODO stop random dir from reseting every frame if event can't move
Game_Event.prototype.moveTypeRandom = function () {
  if (this._freqCount === 0 || this._typeRandomDir === null) {
    this._typeRandomDir = 2 * (Math.randomInt(4) + 1);
  }
  if (!this.canPixelPass(this._px, this._py, this._typeRandomDir)) {
    this._typeRandomDir = 2 * (Math.randomInt(4) + 1);
  }
  this.moveStraight(this._typeRandomDir);
};

Game_Event.prototype.moveTypeTowardPlayer = function () {
  if (this.isNearThePlayer()) {
    if (this._freqCount === 0 || this._typeTowardPlayer === null) {
      this._typeTowardPlayer = Math.randomInt(6);
    }
    switch (this._typeTowardPlayer) {
      case 0:
      case 1:
      case 2:
      case 3: {
        this.moveTowardPlayer();
        break;
      }
      case 4: {
        this.moveTypeRandom();
        break;
      }
      case 5: {
        this.moveForward();
        break;
      }
    }
  } else {
    this.moveTypeRandom();
  }
};

Game_Event.prototype.checkEventTriggerTouch = function (x, y) {
  if (!$gameMap.isEventRunning()) {
    if (this._trigger === 2 && !this.isJumping() && this.isNormalPriority()) {
      var collider = this.collider("collision");
      var prevX = collider.x;
      var prevY = collider.y;
      collider.moveTo(x, y);
      var collided = false;
      ColliderManager.getCharactersNear(
        collider,
        function (chara) {
          if (chara.constructor !== Game_Player) return false;
          collided = chara.collider("collision").intersects(collider);
          return "break";
        }.bind(this)
      );
      collider.moveTo(prevX, prevY);
      if (collided) {
        this._stopCount = 0;
        this._freqCount = this.freqThreshold();
        this.start();
      }
    }
  }
};
