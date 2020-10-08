function Box_Collider() {
  this.initialize.apply(this, arguments);
}

Box_Collider.prototype = Object.create(Polygon_Collider.prototype);
Box_Collider.prototype.constructor = Box_Collider;

Box_Collider.prototype.initialize = function (width, height, ox, oy, options) {
  const points = [
    new Point(0, 0),
    new Point(width, 0),
    new Point(width, height),
    new Point(0, height),
  ];
  Polygon_Collider.prototype.initialize.call(
    this,
    points,
    width,
    height,
    ox,
    oy,
    options
  );
};

Box_Collider.prototype.initMembers = function (width, height, ox, oy, options) {
  Polygon_Collider.prototype.initMembers.call(this, 0, 0);
  ox = ox === undefined ? 0 : ox;
  oy = oy === undefined ? 0 : oy;
  options = options === undefined ? {} : options;
  this._offset = new Point(ox, oy);
  this._pivot = options.pivot || new Point(width / 2, height / 2);
  this._scale = options.scale || this._scale;
  this._radian = options.radian || this._radian;
  this._position = options.position || this._position;
};

Box_Collider.prototype.isPolygon = function () {
  return false;
};

Box_Collider.prototype.isBox = function () {
  return true;
};

Box_Collider.prototype.containsPoint = function (x, y) {
  if (this._radian === 0) {
    const xMin = this._xMin + this.x + this.ox;
    const xMax = this._xMax + this.x + this.ox;
    const yMin = this._yMin + this.y + this.oy;
    const yMax = this._yMax + this.y + this.oy;
    const insideX = x >= xMin && x <= xMax;
    const insideY = y >= yMin && y <= yMax;
    return insideX && insideY;
  } else {
    return Polygon_Collider.prototype.containsPoint.call(this, x, y);
  }
};
