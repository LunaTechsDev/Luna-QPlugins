const Alias_Game_Map_setup = Game_Map.prototype.setup;
Game_Map.prototype.setup = function (mapId) {
  if ($dataMap) {
    ColliderManager._mapWidth = this.width();
    ColliderManager._mapHeight = this.height();
    ColliderManager.refresh();
  }
  Alias_Game_Map_setup.call(this, mapId);
  this.reloadColliders();
};

Game_Map.prototype.tileWidth = function () {
  return QMovement.tileSize;
};

Game_Map.prototype.tileHeight = function () {
  return QMovement.tileSize;
};

Game_Map.prototype.flagAt = function (x, y) {
  x = x || $gamePlayer.x;
  y = y || $gamePlayer.y;
  const flags = this.tilesetFlags();
  const tiles = this.allTiles(x, y);
  for (let i = 0; i < tiles.length; i++) {
    const flag = flags[tiles[i]];
    console.log("layer", i, ":", flag);
    if (flag & 0x20) console.log("layer", i, "is ladder");
    if (flag & 0x40) console.log("layer", i, "is bush");
    if (flag & 0x80) console.log("layer", i, "is counter");
    if (flag & 0x100) console.log("layer", i, "is damage");
  }
};

Game_Map.prototype.gridSize = function () {
  if ($dataMap && $dataMap.meta.grid !== undefined) {
    return Number($dataMap.meta.grid) || QMovement.grid;
  }
  return QMovement.grid;
};

Game_Map.prototype.offGrid = function () {
  if ($dataMap && $dataMap.meta.offGrid !== undefined) {
    return $dataMap.meta.offGrid === "true";
  }
  return QMovement.offGrid;
};

Game_Map.prototype.midPass = function () {
  if ($dataMap && $dataMap.meta.midPass !== undefined) {
    return $dataMap.meta.midPass === "true";
  }
  return QMovement.midPass;
};

const Alias_Game_Map_refreshIfNeeded = Game_Map.prototype.refreshIfNeeded;
Game_Map.prototype.refreshIfNeeded = function () {
  Alias_Game_Map_refreshIfNeeded.call(this);
  if (ColliderManager._needsRefresh) {
    ColliderManager._mapWidth = this.width();
    ColliderManager._mapHeight = this.height();
    ColliderManager.refresh();
    this.reloadColliders();
  }
};

Game_Map.prototype.reloadColliders = function () {
  this.reloadTileMap();
  const events = this.events();
  let i, j;
  for (i = 0, j = events.length; i < j; i++) {
    events[i].reloadColliders();
  }
  const vehicles = this._vehicles;
  for (i = 0, j = vehicles.length; i < j; i++) {
    vehicles[i].reloadColliders();
  }
  $gamePlayer.reloadColliders();
  const followers = $gamePlayer.followers()._data;
  for (i = 0, j = followers.length; i < j; i++) {
    followers[i].reloadColliders();
  }
};

Game_Map.prototype.clearColliders = function () {
  const events = this.events();
  let i, j;
  for (i = 0, j = events.length; i < j; i++) {
    events[i].removeColliders();
  }
  const vehicles = this._vehicles;
  for (i = 0, j = vehicles.length; i < j; i++) {
    vehicles[i].removeColliders();
  }
  $gamePlayer.removeColliders();
  const followers = $gamePlayer.followers()._data;
  for (i = 0, j = followers.length; i < j; i++) {
    followers[i].removeColliders();
  }
};

Game_Map.prototype.reloadTileMap = function () {
  this.setupMapColliders();
  // collider map is also loaded here
  // collision map is also loaded here
};

Game_Map.prototype.setupMapColliders = function () {
  this._tileCounter = 0;
  for (let x = 0; x < this.width(); x++) {
    for (let y = 0; y < this.height(); y++) {
      const flags = this.tilesetFlags();
      const tiles = this.allTiles(x, y);
      const id = x + y * this.width();
      for (let i = tiles.length - 1; i >= 0; i--) {
        const flag = flags[tiles[i]];
        if (flag === 16) continue;
        const data = this.getMapCollider(x, y, flag);
        if (!data) continue;
        if (data[0].constructor === Array) {
          for (let j = 0; j < data.length; j++) {
            this.makeTileCollider(x, y, flag, data[j], j);
          }
        } else {
          this.makeTileCollider(x, y, flag, data, 0);
        }
      }
    }
  }
};

Game_Map.prototype.getMapCollider = function (x, y, flag) {
  const realFlag = flag;
  if (flag >> 12 > 0) {
    flag = flag.toString(2);
    flag = flag.slice(flag.length - 12, flag.length);
    flag = parseInt(flag, 2);
  }
  let boxData;
  if (QMovement.regionColliders[this.regionId(x, y)]) {
    const regionData = QMovement.regionColliders[this.regionId(x, y)];
    boxData = [];
    for (let i = 0; i < regionData.length; i++) {
      boxData[i] = [
        regionData[i].width || 0,
        regionData[i].height || 0,
        regionData[i].ox || 0,
        regionData[i].oy || 0,
        regionData[i].tag || regionData[i].note || "",
        regionData[i].type || "box",
      ];
    }
    flag = 0;
  } else {
    boxData = QMovement.tileBoxes[flag];
  }
  if (!boxData) {
    if (flag & 0x20 || flag & 0x40 || flag & 0x80 || flag & 0x100) {
      boxData = [this.tileWidth(), this.tileHeight(), 0, 0];
    } else {
      return null;
    }
  }
  return boxData;
};

Game_Map.prototype.makeTileCollider = function (x, y, flag, boxData, index) {
  // boxData is array [width, height, ox, oy, note, type]
  const x1 = x * this.tileWidth();
  const y1 = y * this.tileHeight();
  const ox = boxData[2] || 0;
  const oy = boxData[3] || 0;
  const w = boxData[0];
  const h = boxData[1];
  if (w === 0 || h === 0) return;
  const type = boxData[5] || "box";
  let newBox;
  if (type === "circle") {
    newBox = new Circle_Collider(w, h, ox, oy);
  } else if (type === "box") {
    newBox = new Box_Collider(w, h, ox, oy);
  } else {
    return;
  }
  newBox.isTile = true;
  newBox.note = boxData[4] || "";
  newBox.flag = flag;
  newBox.terrain = flag >> 12;
  newBox.regionId = this.regionId(x, y);
  newBox.isWater1 =
    flag >> 12 === QMovement.water1Tag || /<water1>/i.test(newBox.note);
  newBox.isWater2 =
    flag >> 12 === QMovement.water2Tag || /<water2>/i.test(newBox.note);
  newBox.isLadder = flag & 0x20 || /<ladder>/i.test(newBox.note);
  newBox.isBush = flag & 0x40 || /<bush>/i.test(newBox.note);
  newBox.isCounter = flag & 0x80 || /<counter>/i.test(newBox.note);
  newBox.isDamage = flag & 0x100 || /<damage>/i.test(newBox.note);
  newBox.moveTo(x1, y1);
  const vx = x * this.height() * this.width();
  const vy = y * this.height();
  const vz = index;
  newBox.location = vx + vy + vz;
  if (newBox.isWater2) {
    newBox.color = QMovement.water2.toLowerCase();
  } else if (newBox.isWater1) {
    newBox.color = QMovement.water1.toLowerCase();
  } else if (newBox.isLadder || newBox.isBush || newBox.isDamage) {
    newBox.color = "#ffffff";
  } else {
    newBox.color = QMovement.collision.toLowerCase();
  }
  ColliderManager.addCollider(newBox, -1);
  return newBox;
};

Game_Map.prototype.adjustPX = function (x) {
  return this.adjustX(x / QMovement.tileSize) * QMovement.tileSize;
};

Game_Map.prototype.adjustPY = function (y) {
  return this.adjustY(y / QMovement.tileSize) * QMovement.tileSize;
};

Game_Map.prototype.roundPX = function (x) {
  return this.isLoopHorizontal() ? x.mod(this.width() * QMovement.tileSize) : x;
};

Game_Map.prototype.roundPY = function (y) {
  return this.isLoopVertical() ? y.mod(this.height() * QMovement.tileSize) : y;
};

Game_Map.prototype.pxWithDirection = function (x, d, dist) {
  return x + (d === 6 ? dist : d === 4 ? -dist : 0);
};

Game_Map.prototype.pyWithDirection = function (y, d, dist) {
  return y + (d === 2 ? dist : d === 8 ? -dist : 0);
};

Game_Map.prototype.roundPXWithDirection = function (x, d, dist) {
  return this.roundPX(x + (d === 6 ? dist : d === 4 ? -dist : 0));
};

Game_Map.prototype.roundPYWithDirection = function (y, d, dist) {
  return this.roundPY(y + (d === 2 ? dist : d === 8 ? -dist : 0));
};

Game_Map.prototype.deltaPX = function (x1, x2) {
  let result = x1 - x2;
  if (
    this.isLoopHorizontal() &&
    Math.abs(result) > (this.width() * QMovement.tileSize) / 2
  ) {
    if (result < 0) {
      result += this.width() * QMovement.tileSize;
    } else {
      result -= this.width() * QMovement.tileSize;
    }
  }
  return result;
};

Game_Map.prototype.deltaPY = function (y1, y2) {
  let result = y1 - y2;
  if (
    this.isLoopVertical() &&
    Math.abs(result) > (this.height() * QMovement.tileSize) / 2
  ) {
    if (result < 0) {
      result += this.height() * QMovement.tileSize;
    } else {
      result -= this.height() * QMovement.tileSize;
    }
  }
  return result;
};

Game_Map.prototype.canvasToMapPX = function (x) {
  const tileWidth = this.tileWidth();
  const originX = this.displayX() * tileWidth;
  return this.roundPX(originX + x);
};

Game_Map.prototype.canvasToMapPY = function (y) {
  const tileHeight = this.tileHeight();
  const originY = this.displayY() * tileHeight;
  return this.roundPY(originY + y);
};
