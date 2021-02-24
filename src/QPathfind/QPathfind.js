export const _PARAMS = QPlus.getParams("<Luna_QPathfind>");

_PARAMS._DIAGONALS = _PARAMS["Diagonals"];
_PARAMS._INTERVALS = _PARAMS["Intervals"];
_PARAMS._SMARTWAIT = _PARAMS["Smart Wait"];
_PARAMS._DASHONMOUSE = _PARAMS["Dash on Mouse"];
_PARAMS._ANYANGLE = _PARAMS["Any Angle"];

if (_PARAMS._ANYANGLE && typeof QMovement !== "undefined") _PARAMS._DIAGONALS = false;
_PARAMS._DEFAULTOPTIONS = {
  smart: 0, // 0 no smart, 1 recalc on blocked, 2 recalc at intervals
  chase: undefined, // charaID of character it's chasing
  breakable: false, // moving with input breaks pathfind
  earlyEnd: true, // end early if final point isn't passable
  adjustEnd: false, // adjust end point if not passable
  towards: false, // a short A*, returns first 2 steps (similar to Game_Character.prototype.findDirectionTo)
};

// value to use to offset smart ticker when target is far away
// when target is far away no need to calc as often, so we slow it down with offset
_PARAMS._SMARTOT = 300;

// debug will show the console timers
_PARAMS._DEBUG = false;

// smart intervals is based off time instead of a const num
// it will do as many intervals as it can in about half a frame
_PARAMS._SMARTINTERVAL = !true;

//-----------------------------------------------------------------------------
// QPathfind
// Life Cycle:
// Game_Character.initPathfind >
// QPathfind.initialize > QPathfind.initMembers > Qpathfind.beforeStart
// QPathfind.update > QPathfind.aStar
// -if path found:
//   QPathfind.onComplete > Game_Character.startPathfind
//   -when character completes route:
//     Game_Character.onPathfindComplete
// -if path wasn't found
//   QPathfind.onFail > Game_Character.clearPathfind

export default function QPathfind() {
  this.initialize.apply(this, arguments);
}

QPathfind._pathfinders = 0;

QPathfind.prototype.initialize = function (charaId, endPoint, options) {
  this.initMembers(charaId, endPoint, options);
  this.beforeStart();
  this.update();
  QPathfind._pathfinders++;
};

QPathfind.prototype.initMembers = function (charaId, endPoint, options) {
  this._charaId = charaId;
  this.options = Object.assign({}, _PARAMS._DEFAULTOPTIONS, options);
  if (this.options.towards) {
    this.options.earlyEnd = false;
    this.options.adjustEnd = false;
  }
  if (options.chase !== undefined) {
    var chasing = QPlus.getCharacter(options.chase);
    if (!chasing) {
      return this.character().clearPathfind();
    }
    if (typeof QMovement !== "undefined") {
      endPoint = new Point(chasing.px, chasing.py);
    } else {
      endPoint = new Point(chasing.x, chasing.y);
    }
  }
  var startPoint;
  if (typeof QMovement !== "undefined") {
    this._mapWidth = $gameMap.width() * QMovement.tileSize;
    startPoint = new Point(this.character().px, this.character().py);
  } else {
    this._mapWidth = $gameMap.width();
    startPoint = new Point(this.character().x, this.character().y);
  }
  this._startNode = this.node(null, startPoint);
  this._startNode.visited = true;
  this._endNode = this.node(null, endPoint);
  this._originalEnd = this.node(null, endPoint);
  this._openNodes = [this._startNode];
  this._grid = {};
  this._grid[this._startNode.value] = this._startNode;
  this._closed = {};
  this._current = null;
  this._completed = false;
  this._lastRan = 0;
  this._tick = 0;
  this._forceReq = false;
  if (this.options.smart > 1) {
    // TODO smart wait should probably be calculated
    // based on how many pathfinders there are
    // The random is to try to have pathfinders run at different frames
    // inorder to stretch the performance on multiple frames instead of on the same frames
    this._smartTime = _PARAMS._SMARTWAIT + Math.randomIntBetween(0, 10);
  }
  this._intervals = _PARAMS._INTERVALS;
};

QPathfind.prototype.beforeStart = function () {
  if (_PARAMS._DEBUG) console.time("Pathfind");
  var x = this._endNode.x;
  var y = this._endNode.y;
  var canPass = true;
  if (typeof QMovement !== "undefined") {
    canPass = this.character().canPixelPass(x, y, 5, null, "_pathfind");
  } else {
    canPass = this.character().canPass(x, y, 5);
  }
  if (!canPass && this.options.adjustEnd) {
    canPass = true;
    if (!this.adjustEndNode()) {
      canPass = false;
    }
  }
  if (!canPass && this.options.earlyEnd) {
    this.onFail();
  }
  return canPass;
};

QPathfind.prototype.adjustEndNode = function () {
  var x1 = this._endNode.x;
  var y1 = this._endNode.y;
  var x2 = x1;
  var y2 = y1;
  var steps = 0;
  var horz = 0;
  var vert = 0;
  var maxDist = typeof QMovement !== "undefined" ? QMovement.tileSize : 1;
  var neighbors = [];
  var dirs = _PARAMS._DIAGONALS ? 9 : 5;
  for (var i = 1; i < dirs; i++) {
    if (i < 5) {
      horz = vert = i * 2;
    } else {
      horz = i === 5 || i === 6 ? 4 : 6;
      vert = i === 5 || i === 7 ? 2 : 8;
    }
    x2 = x1;
    y2 = y1;
    steps = 0;
    if (typeof QMovement !== "undefined") {
      while (!this.character().canPixelPass(x2, y2, 5, null, "_pathfind")) {
        x2 = $gameMap.roundPXWithDirection(
          x2,
          horz,
          this.character().moveTiles()
        );
        y2 = $gameMap.roundPYWithDirection(
          y2,
          vert,
          this.character().moveTiles()
        );
        steps += this.character().moveTiles();
        if (steps >= maxDist) break;
      }
    } else {
      x2 = $gameMap.roundXWithDirection(x1, horz);
      y2 = $gameMap.roundYWithDirection(y1, vert);
      if (!this.character().canPass(x2, y2, 5)) {
        continue;
      }
    }
    if (
      typeof QMovement !== "undefined" &&
      !this.character().canPixelPass(x2, y2, 5, null, "_pathfind")
    )
      continue;
    var distx1 =
      typeof QMovement !== "undefined"
        ? Math.abs(this.character().px - x2)
        : Math.abs(this.character().x - x2);
    var distx2 = Math.abs(x1 - x2);
    var disty1 =
      typeof QMovement !== "undefined"
        ? Math.abs(this.character().py - y2)
        : Math.abs(this.character().y - y2);
    var disty2 = Math.abs(y1 - y2);
    var score = this.heuristic(
      new Point(distx1, disty1),
      new Point(distx2, disty2)
    );
    neighbors.push({
      x: x2,
      y: y2,
      score: score,
    });
  }
  if (neighbors.length === 0) return false;
  neighbors.sort(function (a, b) {
    return a.score - b.score;
  });
  this._endNode = this.node(null, new Point(neighbors[0].x, neighbors[0].y));
  return true;
};

QPathfind.prototype.compress = function () {
  return {
    options: this._options,
    x: this._endNode.x,
    y: this._endNode.y,
  };
};

QPathfind.prototype.update = function () {
  if (this._lastRan === Graphics.frameCount) {
    // already ran this frame
    return;
  } else {
    this._lastRan = Graphics.frameCount;
  }
  if (this._completed && this.options.smart > 1) {
    this.updateSmart();
  } else if (!this._completed) {
    var stepsPerFrame = this._intervals;
    if (this.options.towards) {
      stepsPerFrame = Math.min(stepsPerFrame, 100);
    }
    var ti;
    if (_PARAMS._SMARTINTERVAL) {
      ti = Date.now();
      stepsPerFrame = 20000; // random large num
    }
    for (var i = 0; i < stepsPerFrame; i++) {
      if (this.options.chase !== undefined) {
        var chasing = QPlus.getCharacter(this.options.chase);
        var oldThrough = chasing._through;
        chasing.setThrough(true);
      }
      this.aStar();
      if (this.options.chase !== undefined) {
        chasing.setThrough(oldThrough);
      }
      if (this._completed) {
        break;
      } else if (this._openNodes.length === 0) {
        this.onFail();
        break;
      }
      if (_PARAMS._SMARTINTERVAL) {
        var dt = Date.now() - ti;
        if (i !== 0 && dt >= 16.67 / (QPathfind._pathfinders + 1)) {
          break;
        }
      }
    }
    if (this.options.towards) {
      this.onComplete();
    }
  }
};

QPathfind.prototype.updateSmart = function () {
  // TODO try to make this even "smarter"
  this._tick++;
  var ot = 0;
  if (!this._forceReq && this.options.chase !== undefined) {
    // TODO return if already touching the character it's chasing
    // TODO if character hasn't moved in X frames force a restart
    var chasing = QPlus.getCharacter(this.options.chase);
    var p1 = new Point(chasing.x, chasing.y);
    var p2 = new Point(this.character().x, this.character().y);
    var dist = this.heuristic(p1, p2);
    var range = 5;
    if (dist > range) {
      ot = _SMARTOT;
    }
    if (!this.options.towards && !this._failed) {
      // If endpoint hasn't changed, no need to recalc
      if (typeof QMovement !== "undefined") {
        if (this._endNode.x === chasing.px && this._endNode.y === chasing.py) {
          return;
        }
      } else {
        if (this._endNode.x === chasing.x && this._endNode.y === chasing.y) {
          return;
        }
      }
    }
  }
  if (this._tick > this._smartTime + ot) {
    return this.character().restartPathfind();
  }
};

QPathfind.prototype.requestRestart = function (ot) {
  if (!this._completed) return;
  if (this.options.chase !== undefined) {
    var chasing = QPlus.getCharacter(this.options.chase);
    if (!chasing) return this.character().clearPathfind();
    var dx = chasing.cx() - this.character().cx();
    var dy = chasing.cy() - this.character().cy();
    var radian = Math.atan2(dy, dx);
    var x2 =
      this.character().px + Math.cos(radian) * this.character().moveTiles();
    var y2 =
      this.character().py + Math.sin(radian) * this.character().moveTiles();
    var colliderA = this.character().collider("collision");
    var colliderB = chasing.collider("collision");
    colliderA.moveTo(x2, y2);
    var collided = colliderA.intersects(colliderB);
    colliderA.moveTo(this.character().px, this.character().py);
    if (collided) return;
  }
  ot = ot === undefined ? 0 : ot;
  this._tick = this._smartTime - ot;
  this._forceReq = true;
};

QPathfind.prototype.node = function (parent, point) {
  return {
    parent: parent,
    visited: false,
    x: point.x,
    y: point.y,
    value: point.x + point.y * this._mapWidth,
    f: 0,
    g: 0,
    h: 0,
  };
};

QPathfind.prototype.getNodeAt = function (current, x, y) {
  var node;
  var val = x + y * this._mapWidth;
  if (this._grid[val]) {
    node = this._grid[val];
  } else {
    node = this.node(current, new Point(x, y));
    this._grid[val] = node;
  }
  return node;
};

QPathfind.prototype.character = function () {
  return QPlus.getCharacter(this._charaId);
};

QPathfind.prototype.aStar = function () {
  var currI = 0;
  var i, j;
  this._current = this._openNodes[0];
  j = this._openNodes.length;
  for (i = 0; i < j; i++) {
    if (this._openNodes[i].f < this._current.f) {
      this._current = this._openNodes[i];
      currI = i;
    }
  }
  if (this._current.value === this._endNode.value) {
    return this.onComplete();
  }
  this._openNodes.splice(currI, 1);
  this._closed[this._current.value] = true;
  var neighbors = this.findNeighbors(this._current);
  j = neighbors.length;
  for (i = 0; i < j; i++) {
    if (this._closed[neighbors[i].value]) continue;
    var gScore = this._current.g + this.heuristic(this._current, neighbors[i]);
    if (!neighbors[i].visited) {
      neighbors[i].visited = true;
      this._openNodes.push(neighbors[i]);
    } else if (gScore >= neighbors[i].g) {
      continue;
    }
    neighbors[i].g = gScore;
    neighbors[i].f = gScore + this.heuristic(neighbors[i], this._endNode);
    neighbors[i].parent = this._current;
  }
};

QPathfind.prototype.findNeighbors = function (current) {
  var chara = this.character();
  var x = current.x;
  var y = current.y;
  var xf = this._endNode.x;
  var yf = this._endNode.y;
  var neighbors = [];
  var stepDist = 1;
  if (typeof QMovement !== "undefined") {
    stepDist = chara.moveTiles();
    var nearEnd =
      Math.abs(x - xf) < chara.optTiles() &&
      Math.abs(y - yf) < chara.optTiles();
    var tiles = nearEnd ? chara.moveTiles() : chara.optTiles();
  }
  var i;
  var j = !typeof QMovement !== "undefined" && _PARAMS._DIAGONALS ? 8 : 4;
  var dirs = [2, 4, 6, 8, 1, 3, 7, 9];
  var diags = {
    1: [4, 2],
    3: [6, 2],
    7: [4, 8],
    9: [6, 8],
  };
  for (i = 0; i < j; i++) {
    var dir = dirs[i];
    var horz = dirs[i];
    var vert = dirs[i];
    if (i >= 4) {
      horz = diags[dir][0];
      vert = diags[dir][1];
    }
    var passed = false;
    var onEnd = false;
    var x2, y2;
    if (typeof QMovement !== "undefined") {
      x2 = $gameMap.roundPXWithDirection(x, horz, tiles);
      y2 = $gameMap.roundPYWithDirection(y, vert, tiles);
      passed = chara.canPixelPass(x, y, dir, tiles, "_pathfind");
      if (!passed && tiles / 2 > chara.moveTiles()) {
        x2 = $gameMap.roundPXWithDirection(x, horz, tiles / 2);
        y2 = $gameMap.roundPYWithDirection(y, vert, tiles / 2);
        passed = chara.canPixelPass(x, y, dir, tiles / 2, "_pathfind");
      }
    } else {
      x2 = $gameMap.roundXWithDirection(x, horz);
      y2 = $gameMap.roundYWithDirection(y, vert);
      if (i >= 4) {
        passed = chara.canPassDiagonally(x, y, horz, vert);
      } else {
        passed = chara.canPass(x, y, dir);
      }
    }
    var val = x2 + y2 * this._mapWidth;
    if (passed || val === this._endNode.value) {
      var node = this.getNodeAt(current, x2, y2);
      if (typeof QMovement !== "undefined") {
        if (Math.abs(x2 - xf) < stepDist && Math.abs(y2 - yf) < stepDist) {
          // this is as close as we can get
          // so force early end
          node.value = this._endNode.value;
        }
      }
      neighbors.push(node);
    }
  }
  return neighbors;
};

QPathfind.prototype.onComplete = function () {
  if (_PARAMS._DEBUG) console.timeEnd("Pathfind");
  QPathfind._pathfinders--;
  this._completed = true;
  this._failed = false;
  this._grid = {};
  if (this.options.towards) {
    var firstSteps = this.createFinalPath().slice(0, 3);
    return this.character().startPathfind(firstSteps);
  }
  this.character().startPathfind(this.createFinalPath());
};

QPathfind.prototype.onFail = function () {
  if (_PARAMS._DEBUG) console.timeEnd("Pathfind");
  QPathfind._pathfinders--;
  this._completed = true;
  this._failed = true;
  this._grid = {};
  if (this.options.towards) {
    return this.onComplete();
  }
  if (this.options.chase !== undefined) {
    return;
  }
  this.character().clearPathfind();
};

QPathfind.prototype.createFinalPath = function () {
  var node = this._current;
  var path = [node];
  while (node.parent) {
    var next = node.parent;
    if (_PARAMS._ANYANGLE && $gameMap.offGrid()) {
      while (
        next.parent &&
        this.character().canPassToFrom(
          node.x,
          node.y,
          next.parent.x,
          next.parent.y,
          "_pathfind"
        )
      ) {
        next = next.parent;
      }
    } else if (_PARAMS._DIAGONALS) {
      while (next.parent) {
        var dx = node.x - next.parent.x;
        var dy = node.y - next.parent.y;
        var rad = Math.atan2(dy, dx);
        rad += rad < 0 ? Math.PI * 2 : 0;
        var deg = Math.floor((rad * 180) / Math.PI);
        if (
          [45, 135, 225, 315].contains(deg) &&
          this.character().canPassToFrom(
            node.x,
            node.y,
            next.parent.x,
            next.parent.y,
            "_pathfind"
          )
        ) {
          next = next.parent;
        } else {
          break;
        }
      }
    }
    node = next;
    path.unshift(node);
  }
  return path;
};

// http://theory.stanford.edu/~amitp/GameProgramming/Heuristics.html
QPathfind.prototype.heuristic = function (initial, final) {
  var dx = Math.abs(initial.x - final.x);
  var dy = Math.abs(initial.y - final.y);
  if (!_PARAMS._DIAGONALS) {
    return dx + dy;
  } else {
    var D = 1;
    var D2 = Math.sqrt(2);
    return D * (dx + dy) + (D2 - 2 * D) * Math.min(dx, dy);
  }
};

// static
QPathfind.pathToRoute = function (chara, path) {
  var route = {
    list: [],
    repeat: false,
    skippable: false,
    wait: false,
  };
  var current = path[0];
  var codes = {
    2: 1,
    4: 2,
    6: 3,
    8: 4,
    1: 5,
    3: 6,
    7: 7,
    9: 8,
  };
  for (var i = 1; i < path.length; i++) {
    if (!path[i]) break;
    var sx = current.x - path[i].x;
    var sy = current.y - path[i].y;
    var dist, dir;
    if (sx !== 0 && sy !== 0) {
      // diag
      var horz = sx > 0 ? 4 : 6;
      var vert = sy > 0 ? 8 : 2;
      if (horz === 4 && vert === 8) dir = 7;
      if (horz === 4 && vert === 2) dir = 1;
      if (horz === 6 && vert === 8) dir = 9;
      if (horz === 6 && vert === 2) dir = 3;
      dist = Math.abs(sx);
    } else if (sx !== 0) {
      // horz
      dir = sx > 0 ? 4 : 6;
      dist = Math.abs(sx);
    } else if (sy !== 0) {
      // vert
      dir = sy > 0 ? 8 : 2;
      dist = Math.abs(sy);
    }
    var command = {};
    if (typeof QMovement !== "undefined") {
      if (_PARAMS._ANYANGLE && $gameMap.offGrid()) {
        var radian = Math.atan2(-sy, -sx);
        if (radian < 0) radian += Math.PI * 2;
        dist = Math.sqrt(sx * sx + sy * sy);
        command.code = Game_Character.ROUTE_SCRIPT;
        command.parameters = ["qmove2(" + radian + "," + dist + ")"];
      } else {
        command.code = Game_Character.ROUTE_SCRIPT;
        command.parameters = ["qmove(" + dir + "," + dist + ")"];
      }
    } else {
      command.code = codes[dir];
    }
    route.list.push(command);
    current = path[i];
  }
  route.list.push({
    code: 0,
  });
  return route;
};
