var Alias_Game_Map_reloadTileMap = Game_Map.prototype.reloadTileMap;
Game_Map.prototype.reloadTileMap = function () {
  Alias_Game_Map_reloadTileMap.call(this);
  this.setupCollisionMap();
};

Game_Map.prototype.setupCollisionMap = function () {
  var cm = /<cm:(.*?)>/i.exec($dataMap.note);
  // regionmaps are disabled
  //var rm = /<rm[=|:](.*?)>/i.exec($dataMap.note);
  this.loadCollisionmap(cm ? cm[1] : null);
};

Game_Map.prototype.loadCollisionmap = function (collisionMap) {
  if (collisionMap) {
    ColliderManager.setCollisionMap(collisionMap);
    this._hasCM = true;
  } else {
    ColliderManager.clearCollisionMap();
    this._hasCM = false;
  }
};

Game_Map.prototype.collisionMapPass = function (collider, dir, passableColors) {
  if (!ColliderManager.collisionMap.bitmap.isReady()) return false;
  if (collider.isCircle()) {
    return this.collisionMapCirclePass(collider, dir, passableColors);
  } else if (collider.isBox()) {
    return this.collisionMapBoxPass(collider, dir, passableColors);
  }
  return false;
};

Game_Map.prototype.insidePassableOnly = function (collider, passableColors) {
  return (
    this.collisionMapBoxPass(collider, "top", passableColors) &&
    this.collisionMapBoxPass(collider, "bottom", passableColors)
  );
};

Game_Map.prototype.collisionMapBoxPass = function (
  collider,
  dir,
  passableColors
) {
  if (collider._radian !== 0) {
    return this.collisionMapPolyPass(collider, dir, passableColors);
  }
  var edgePoints = collider.edge();
  var edges = {
    top: {
      x1: edgePoints.x1,
      x2: edgePoints.x2,
      y1: edgePoints.y1,
      y2: edgePoints.y1,
    },
    bottom: {
      x1: edgePoints.x1,
      x2: edgePoints.x2,
      y1: edgePoints.y2,
      y2: edgePoints.y2,
    },
    left: {
      x1: edgePoints.x1,
      x2: edgePoints.x1,
      y1: edgePoints.y1,
      y2: edgePoints.y2,
    },
    right: {
      x1: edgePoints.x2,
      x2: edgePoints.x2,
      y1: edgePoints.y1,
      y2: edgePoints.y2,
    },
  };
  var x1 = Math.floor(edges[dir].x1);
  var x2 = Math.floor(edges[dir].x2);
  var y1 = Math.floor(edges[dir].y1);
  var y2 = Math.floor(edges[dir].y2);
  for (var x = x1; x <= x2; ) {
    for (var y = y1; y <= y2; ) {
      if (
        !passableColors.contains(
          ColliderManager.collisionMap.bitmap.getColor(x, y)
        )
      ) {
        return false;
      }
      y = Math.min(y2 + 1, y + _SCANSIZE);
    }
    x = Math.min(x2 + 1, x + _SCANSIZE);
  }
  return true;
};

Game_Map.prototype.collisionMapCirclePass = function (
  collider,
  dir,
  passableColors
) {
  switch (dir) {
    case "bottom": {
      var r1 = Math.PI;
      var r2 = Math.PI * 2;
      var s = Math.PI / collider.width;
      break;
    }
    case "left": {
      var r1 = Math.PI / 2;
      var r2 = (3 * Math.PI) / 2;
      var s = Math.PI / collider.height;
      break;
    }
    case "right": {
      var r1 = -Math.PI / 2;
      var r2 = Math.PI / 2;
      var s = Math.PI / collider.height;
      break;
    }
    case "top": {
      var r1 = 0;
      var r2 = Math.PI;
      var s = Math.PI / collider.width;
      break;
    }
  }
  var r3;
  while (r1 <= r2) {
    r3 = r1 + collider._radian;
    var pos = collider.circlePosition(r3);
    var x = Math.floor(pos.x);
    var y = Math.floor(pos.y);
    if (
      !passableColors.contains(
        ColliderManager.collisionMap.bitmap.getColor(x, y)
      )
    ) {
      return false;
    }
    r1 += s * _SCANSIZE;
  }
  return true;
};

Game_Map.prototype.collisionMapPolyPass = function (
  collider,
  dir,
  passableColors
) {
  var points = collider._vertices.slice();
  var finalPoints = [];
  var midPoints = [];
  if (dir === "top" || dir === "bottom") {
    var startPoint = this.collisionMapPoints(collider, dir, collider._xMin, 0);
    var endPoint = this.collisionMapPoints(collider, dir, collider._xMax, 0);
  } else {
    // left or right
    var startPoint = this.collisionMapPoints(collider, dir, collider._yMin, 1);
    var endPoint = this.collisionMapPoints(collider, dir, collider._yMax, 1);
    var horz = true;
  }
  var minIndex = collider._baseVertices.indexOf(startPoint);
  var maxIndex = collider._baseVertices.indexOf(endPoint);
  var endPoint = collider.vertices()[maxIndex];
  var firstHalf = points.splice(0, minIndex);
  points = points.concat(firstHalf);
  if (dir === "bottom" || dir === "left") {
    points.reverse();
    points.unshift(points.pop());
  }
  for (var i = 0; i < points.length - 1; i++) {
    var x1 = points[i].x;
    var y1 = points[i].y;
    var x2 = points[i + 1].x;
    var y2 = points[i + 1].y;
    var rad = Math.atan2(y1 - y2, x2 - x1);
    if (horz) {
      var steps = Math.abs(y2 - y1) / _SCANSIZE;
      var slope = (x2 - x1) / steps;
      var inc = y1 > y2 ? -1 : 1;
    } else {
      var steps = Math.abs(x2 - x1) / _SCANSIZE;
      var slope = (y2 - y1) / steps;
      var inc = x1 > x2 ? -1 : 1;
    }
    var a1 = (a2 = horz ? y1 : x1);
    while (a1 - a2 <= steps) {
      if (
        !passableColors.contains(
          ColliderManager.collisionMap.bitmap.getColor(x1, y1)
        )
      ) {
        return false;
      }
      a1++;
      y1 += horz ? inc : slope;
      x1 += horz ? slope : inc;
    }
    if (x2 === endPoint.x && y2 === endPoint.y) {
      break;
    }
  }
  return true;
};

Game_Map.prototype.collisionMapPoints = function (collider, dir, value, axis) {
  var point = collider._baseVertices.filter(function (p) {
    return axis === 0 ? p.x === value : p.y === value;
  });
  point.sort(function (a, b) {
    if (axis === 0) {
      if (dir === "top") {
        return a.y - b.y;
      } else {
        return b.y - a.y;
      }
    } else {
      if (dir === "left") {
        return a.x - b.x;
      } else {
        return b.x - a.x;
      }
    }
  });
  point = point[0];
  for (var i = 0; i < collider._baseVertices.length; i++) {
    if (
      collider._baseVertices[i].x === point.x &&
      collider._baseVertices[i].y === point.y
    ) {
      return collider._baseVertices[i];
    }
  }
};
