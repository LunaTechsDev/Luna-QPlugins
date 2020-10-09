import QMovement from "../QMovement";

export default function Sprite_Collider() {
  this.initialize.apply(this, arguments);
}

Sprite_Collider.prototype = Object.create(Sprite.prototype);
Sprite_Collider.prototype.constructor = Sprite_Collider;

Sprite_Collider.prototype.initialize = function (collider, duration) {
  Sprite.prototype.initialize.call(this);
  this._emitter = new PIXI.utils.EventEmitter();
  this.z = 7;
  this._duration = duration || 0;
  this._cache = {};
  this.setupCollider(collider);
  this.checkChanges();
};

Sprite_Collider.prototype.on = function (eventName, func) {
  this._emitter.on(eventName, func);
};

Sprite_Collider.prototype.setCache = function () {
  this._cache = {
    color: this._collider.color,
    width: this._collider.width,
    height: this._collider.height,
    radian: this._collider._radian,
  };
};

Sprite_Collider.prototype.needsRedraw = function () {
  return (
    this._cache.width !== this._collider.width ||
    this._cache.height !== this._collider.height ||
    this._cache.color !== this._collider.color ||
    this._cache.radian !== this._collider._radian
  );
};

Sprite_Collider.prototype.setupCollider = function (collider) {
  this._collider = collider;
  let isNew = false;
  if (!this._colliderSprite) {
    this._colliderSprite = new PIXI.Graphics();
    isNew = true;
  }
  this.drawCollider();
  if (isNew) {
    this.addChild(this._colliderSprite);
  }
};

Sprite_Collider.prototype.drawCollider = function () {
  const collider = this._collider;
  this._colliderSprite.clear();
  let color = (collider.color || "#ff0000").replace("#", "");
  color = parseInt(color, 16);
  this._colliderSprite.beginFill(color);
  if (collider.isCircle()) {
    const radiusX = collider.radiusX;
    const radiusY = collider.radiusY;
    this._colliderSprite.drawEllipse(0, 0, radiusX, radiusY);
    this._colliderSprite.rotation = collider._radian;
  } else {
    this._colliderSprite.drawPolygon(collider._baseVertices);
  }
  this._colliderSprite.endFill();
};

Sprite_Collider.prototype.update = function () {
  Sprite.prototype.update.call(this);
  this.checkChanges();
  if (this._duration >= 0 || this._collider.kill) {
    this.updateDecay();
  }
};

Sprite_Collider.prototype.checkChanges = function () {
  this.visible = !this._collider._isHidden;
  this.x = this._collider.x + this._collider.ox;
  this.x -= $gameMap.displayX() * QMovement.tileSize;
  this.y = this._collider.y + this._collider.oy;
  this.y -= $gameMap.displayY() * QMovement.tileSize;
  if (this.x < -this._collider.width || this.x > Graphics.width) {
    if (this.y < -this._collider.height || this.y > Graphics.height) {
      this.visible = false;
    }
  }
  this._colliderSprite.z = this.z;
  this._colliderSprite.visible = this.visible;
  if (this.needsRedraw()) {
    this.drawCollider();
    this.setCache();
  }
};

Sprite_Collider.prototype.updateDecay = function () {
  this._duration--;
  if (this._duration <= 0 || this._collider.kill) {
    this._emitter.emit("collider-kill", this);
    this._collider = null;
  }
};
