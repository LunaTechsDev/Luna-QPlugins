export default function Sprite_MapObject() {
  this.initialize.apply(this, arguments);
}

Sprite_MapObject.prototype = Object.create(Sprite.prototype);
Sprite_MapObject.prototype.constructor = Sprite_MapObject;

Sprite_MapObject.prototype.initialize = function (mapObj) {
  Sprite.prototype.initialize.call(this);
  this._mapObj = mapObj;
  this._tick = 0;
  this._lastFrameI = null;
  this._frameI = this._mapObj.index || 0;
  this._patternI = 0;
  this._maxFrames = this._mapObj.cols * this._mapObj.rows;
  this.z = 0;
};

Sprite_MapObject.prototype.setupAnimation = function (req) {
  this._tick = 0;
  this._frameI = 0;
  this._acceptedReq = req;
};

Sprite_MapObject.prototype.update = function () {
  Sprite.prototype.update.call(this);
  if (this._mapObj._requestingAnim && !this._acceptedReq) {
    this.setupAnimation(this._mapObj._requestingAnim);
  }
  if (this._mapObj.type === "animated") {
    this.updateAnimation();
  }
  if (this._mapObj.type === "QSprite") {
    this.updateQSprite();
  }
  this.updateBitmap();
  this.updateFrame();
  this.updatePosition();
  this.updateOther();
};

Sprite_MapObject.prototype.updateAnimation = function () {
  if (this._tick % this._mapObj.speed === 0) {
    const isFinal = this._frameI === this._maxFrames - 1;
    this._frameI = (this._frameI + 1) % this._maxFrames;
    if (this._acceptedReq && isFinal) {
      if (this._acceptedReq === "once") {
        this._mapObj.clearAnimateRequest();
        this._acceptedReq = false;
      }
      if (this._acceptedReq === "once2") {
        this._mapObj.clearAnimateRequest();
        this._acceptedReq = false;
        this._frameI = this._maxFrames - 1;
      }
    }
  }
  this._tick = (this._tick + 1) % this._mapObj.speed;
};

Sprite_MapObject.prototype.updateQSprite = function () {
  const speed = this._mapObj._qSprite.speed;
  if (this._tick % speed === 0) {
    const pattern = this._mapObj._qSprite.pattern;
    this._patternI = (this._patternI + 1) % pattern.length;
    this._frameI = pattern[this._patternI];
  }
  this._tick = (this._tick + 1) % speed;
};

Sprite_MapObject.prototype.updateBitmap = function () {
  if (this._filePath !== this._mapObj.filePath) {
    this._filePath = this._mapObj.filePath;
    let path = this._filePath.split(/\/|\\/);
    const fileName = path.pop().split(".");
    const ext = fileName.pop();
    path.push(encodeURIComponent(fileName.join(".")) + "." + ext);
    path = path.join("/");
    //#if _MV
    this.bitmap = ImageManager.loadNormalBitmap(path, 0);
    //#else
    this.bitmap = ImageManager.loadBitmapFromUrl(path);
    //#endif
    this.bitmap.smooth = this._mapObj.meta.smooth;
    this._lastFrameI = null;
    this.bitmap.addLoadListener(
      function () {
        this._lastFrameI = null;
      }.bind(this)
    );
  }
};

Sprite_MapObject.prototype.updateFrame = function () {
  if (this._lastFrameI !== null) {
    if (this._lastFrameI === this._frameI) return;
  }
  if (this._mapObj.type !== "full") {
    const i = this._frameI;
    const cols = this._mapObj.cols;
    const rows = this._mapObj.rows;
    const pw = this.bitmap.width / cols;
    const ph = this.bitmap.height / rows;
    const point = QPlus.indexToPoint(i, cols, rows);
    const sx = point.x * pw;
    const sy = point.y * ph;
    this.setFrame(sx, sy, pw, ph);
    this._lastFrameI = i;
  }
};

Sprite_MapObject.prototype.updatePosition = function () {
  this.x = this._mapObj.screenX();
  this.y = this._mapObj.screenY();
  this.z = this._mapObj.z;
  this.anchor.x = this._mapObj.anchorX;
  this.anchor.y = this._mapObj.anchorY;
};

Sprite_MapObject.prototype.updateOther = function () {
  this.alpha = this._mapObj.alpha;
  this.scale.x = this._mapObj.scale.x;
  this.scale.y = this._mapObj.scale.y;
  this.rotation = this._mapObj.rotation;
  this.visible = this._mapObj.visible;
  this.setColorTone(this._mapObj.tone);
};
