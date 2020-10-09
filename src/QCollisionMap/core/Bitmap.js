var Alias_Bitmap_initialize = Bitmap.prototype.initialize;
Bitmap.prototype.initialize = function (width, height) {
  Alias_Bitmap_initialize.call(this, width, height);
  this._pixelData = [];
};

Bitmap.prototype._setPixelData = function () {
  this._pixelData = this.context.getImageData(
    0,
    0,
    this.width,
    this.height
  ).data;
};

// Optimized version of getPixel() by caching
Bitmap.prototype.getColor = function (x, y) {
  if (this._pixelData.length === 0) this._setPixelData();
  x = Math.floor(x);
  y = Math.floor(y);
  if (
    x >= this.width ||
    x < 0 ||
    y >= this.height ||
    y < 0 ||
    this._pixelData.length === 0
  ) {
    return "#00000000";
  }
  var i = x * 4 + y * 4 * this.width;
  var result = "#";
  if (this._pixelData[i + 3] === 0) {
    return "#00000000";
  }
  for (var c = 0; c < 3; c++) {
    result += this._pixelData[i + c].toString(16).padZero(2);
  }
  return result;
};
