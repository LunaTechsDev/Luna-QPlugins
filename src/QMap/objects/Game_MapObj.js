import { ColliderManager } from "../constants";

export default function Game_MapObj() {
  this.initialize.apply(this, arguments);
}

Game_MapObj.prototype.initialize = function (mapId, objData) {
  /**
   * objData Properties
   *  @param name [string]
   *  @param x [int]
   *  @param y [int]
   *  @param z [int]
   *  @param filePath [string]
   *  @param type [string]
   *  @param cols [int]
   *  @param rows [int]
   *  @param index [int]
   *  @param speed [int]
   *  @param width [int]
   *  @param height [int]
   *  @param anchorX [int]
   *  @param anchorY [int]
   *  @param scaleX [int]
   *  @param scaleY [int]
   *  @param angle [int]
   *  @param conditions [object[]]
   *  @param note [string]
   *  @param meta [object]
   *  @param isQSprite [string]
   *  @param pose [string]
   */
  for (const prop in objData) {
    let propName = String(prop);
    let value = objData[prop];
    if (propName === "notes" || propName === "meta") {
      continue;
    }
    if (propName === "conditions") {
      value = value.map(function (v) {
        v.value = QPlus.stringToType(JSON.stringify(v.value));
        return v;
      });
    }
    if (propName === "x") {
      propName = "px";
    }
    if (propName === "y") {
      propName = "py";
    }
    this[propName] = value;
  }
  if (!this.conditions) {
    this.conditions = [];
  }
  this.meta = this.qmeta || {};

  if (typeof QSprite !== "undefined" && this.isQSprite) {
    this.convertQSprite();
  }
  this.initMembers();
};

Game_MapObj.prototype.convertQSprite = function () {
  const config = QSprite.json[this.isQSprite];
  if (!config) return;
  this.anchorX = config.anchorX;
  this.anchorY = config.anchorY;
  this.cols = config.cols;
  this.rows = config.rows;
  this.type = "QSprite";
  this._qSprite = config.poses[this.pose];
};

Game_MapObj.prototype.initMembers = function () {
  const tw = $gameMap.tileWidth();
  const th = $gameMap.tileHeight();
  this.x = this.px / tw;
  this.y = this.py / th;
  this.alpha = 1;
  this.scale = new Point(this.scaleX, this.scaleY);
  this.rotation = this.angle * (Math.PI / 180);
  this.visible = true;
  this.setupBreath();
  this.setupTone();
};

Game_MapObj.prototype.setupBreath = function () {
  if (!this.meta.breath) return;
  const args = this.meta.breath.split(",").map(Number);
  this._breathS = args[0] === undefined ? 1 : args[0] / 100;
  this._breathT = args[1] === undefined ? 60 : args[1];
  this._breathOT = args[2] === undefined ? 0 : args[2];
  this._breathTick = this._breathOT;
};

Game_MapObj.prototype.setupTone = function () {
  this.tone = [0, 0, 0, 0];
  if (!this.meta.tint) return;
  this.tone = this.meta.tint.split(",").map(Number);
  this.tone[0] = this.tone[0] || 0;
  this.tone[1] = this.tone[1] || 0;
  this.tone[2] = this.tone[2] || 0;
  this.tone[3] = this.tone[3] || 0;
};

Game_MapObj.prototype.screenX = function () {
  const tw = $gameMap.tileWidth();
  const x = $gameMap.adjustX(this.x);
  return Math.round(x * tw);
};

Game_MapObj.prototype.screenY = function () {
  const th = $gameMap.tileHeight();
  const y = $gameMap.adjustY(this.y);
  return Math.round(y * th);
};

Game_MapObj.prototype.charaId = function () {
  return "MAPOBJ-" + this.name;
};

Game_MapObj.prototype.isThrough = function () {
  return !this.visible;
};

Game_MapObj.prototype.isNormalPriority = function () {
  return true;
};

Game_MapObj.prototype.notes = function () {
  return this.note;
};

Game_MapObj.prototype.requestAnimate = function (mode, speed) {
  if (this._requestingAnim) {
    clearAnimateRequest();
  }
  this._requestingAnim = mode;
  this._oldSpeed = this.speed;
  this.speed = speed;
  this._oldType = this.type;
  this.type = "animated";
};

Game_MapObj.prototype.clearAnimateRequest = function () {
  this._requestingAnim = null;
  this.type = this._oldType;
  this.speed = this._oldSpeed;
};

Game_MapObj.prototype.playPose = function (pose) {
  if (!this._qSprite) return;
  // TODO: change the QSprite stuff
};

Game_MapObj.prototype.update = function () {
  this.updateConditions();
  if (!this.visible) return;
  const playerX = $gamePlayer._realX;
  const playerY = $gamePlayer._realY;
  if (this._playerX !== playerX || this._playerY !== playerY) {
    const dx = this._playerX - playerX;
    const dy = this._playerY - playerY;
    this.updatePlayerMoved(dx, dy);
    this._playerX = playerX;
    this._playerY = playerY;
  }
  if (this.meta.breath) this.updateBreath();
};

Game_MapObj.prototype.updateConditions = function () {
  let isOk = true;
  for (let i = 0; i < this.conditions.length; i++) {
    const cond = this.conditions[i];
    if (cond.type === "switch") {
      isOk = $gameSwitches.value(cond.value[0]) === cond.value[1];
    }
    if (cond.type === "var") {
      isOk = $gameVariables.value(cond.value[0]) === cond.value[1];
    }
    if (cond.type === "js") {
      isOk = !!eval(value[0]);
    }
    if (!isOk) break;
  }
  this.visible = isOk;
};

Game_MapObj.prototype.updatePlayerMoved = function (dx, dy) {
  if (this.meta.onPlayer) this.updateOnPlayer();
  // add more functions that are based off player here
};

Game_MapObj.prototype.updateOnPlayer = function () {
  this.alpha = 1;
  if ($gamePlayer.screenY() < this.screenY()) {
    if (this.intersectsWith("interaction", $gamePlayer)) {
      this.alpha = 0.5;
    }
  }
};

Game_MapObj.prototype.updateBreath = function () {
  const rt = (this._breathTick % this._breathT) / this._breathT;
  const s = Math.sin(rt * Math.PI * 2) * this._breathS;
  this.scale = new Point(1 + s, 1 + s);
  this._breathTick = (this._breathTick + 1) % this._breathT;
};

Game_MapObj.prototype.intersectsWith = function (type, chara) {
  if (!this.visible) {
    return false;
  }
  if (typeof QMovement === "undefined") {
    return this.intersectsWithSimple(type, chara._realX, chara._realY);
  } else {
    return this.collider(type).intersects(chara.collider("collision"));
  }
};

Game_MapObj.prototype.intersectsWithSimple = function (type, x1, y1) {
  const bounds = this.getTileBounds(type);
  const x2 = x1 + 0.9;
  const y2 = y1 + 0.9;
  const insideX1 =
    (x1 >= bounds.x1 && x1 <= bounds.x2) ||
    (x2 >= bounds.x1 && x2 <= bounds.x2);
  const insideY1 =
    (y1 >= bounds.y1 && y1 <= bounds.y2) ||
    (y2 >= bounds.y1 && y2 <= bounds.y2);
  const insideX2 =
    (bounds.x1 >= x1 && bounds.x1 <= x2) ||
    (bounds.x2 >= x1 && bounds.x2 <= x2);
  const insideY2 =
    (bounds.y1 >= y1 && bounds.y1 <= y2) ||
    (bounds.y2 >= x1 && bounds.y2 <= y2);
  return (insideX1 || insideX2) && (insideY1 || insideY2);
};

Game_MapObj.prototype.collider = function (type) {
  if (!$dataMap) return;
  if (!this.meta.collider && !this.meta.colliders) return null;
  if (!this._colliders) this.setupColliders();
  return this._colliders[type] || this._colliders.default;
};

Game_MapObj.prototype.reloadColliders = function () {
  this.removeColliders();
  this.setupColliders();
};

Game_MapObj.prototype.removeColliders = function () {
  for (const collider in this._colliders) {
    if (!this._colliders.hasOwnProperty(collider)) continue;
    if (typeof QMovement !== "undefined") {
      ColliderManager.remove(this._colliders[collider]);
    }
    this._colliders[collider] = null;
  }
};

Game_MapObj.prototype.setupColliders = function () {
  if (!$dataMap) return;
  let configs = {};
  this._colliders = {};
  if (this.meta.colliders) {
    configs = QPlus.stringToObj(this.meta.colliders);
  }
  if (this.meta.collider) {
    configs.default = QPlus.stringToAry(this.meta.collider);
  }
  for (const collider in configs) {
    if (!configs.hasOwnProperty(collider)) continue;
    this._colliders[collider] = this.convertToCollider(
      configs[collider],
      collider
    );
  }
  if (this.collider("collision")) {
    Game_CharacterBase.prototype.makeBounds.call(this);
  }
};

Game_MapObj.prototype.convertToCollider = function (arr, ctype) {
  if (typeof QMovement === "undefined") {
    return this.toSimpleCollider(arr);
  }
  const collider = ColliderManager.convertToCollider(arr);
  collider.note = this.note;
  collider.isMapObj = true;
  collider.type = ctype;
  const x1 = this.px + this.width * -this.anchorX;
  const y1 = this.py + this.height * -this.anchorY;
  collider.moveTo(x1, y1);
  ColliderManager.addCollider(collider, -1, true);
  return collider;
};

Game_MapObj.prototype.toSimpleCollider = function (arr) {
  if (arr[0] !== "box") return null;
  return {
    isSimple: true,
    width: arr[1] || 0,
    height: arr[2] || 0,
    ox: arr[3] || 0,
    oy: arr[4] || 0,
  };
};

Game_MapObj.prototype.getTileBounds = function (type) {
  if (this.collider(type)) {
    return this.getSimpleColliderBounds(type);
  }
  const tw = $gameMap.tileWidth();
  const th = $gameMap.tileHeight();
  const x1 = this.x;
  const y1 = this.y;
  const x2 = x1 + this.width / tw;
  const y2 = y1 + this.height / th;
  return {
    x1: x1,
    y1: y1,
    x2: x2,
    y2: y2,
  };
};

Game_MapObj.prototype.getSimpleColliderBounds = function (type) {
  const collider = this.collider(type);
  const tw = $gameMap.tileWidth();
  const th = $gameMap.tileHeight();
  const x1 = this.x + (this.width * -this.anchorX) / tw + collider.ox / tw;
  const y1 = this.y + (this.height * -this.anchorY) / th + collider.oy / th;
  const x2 = x1 + collider.width / tw;
  const y2 = y1 + collider.height / th;
  return {
    x1: x1,
    y1: y1,
    x2: x2,
    y2: y2,
  };
};
