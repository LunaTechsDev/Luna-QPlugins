export const _PARAMS = QPlus.getParams("<Luna_QPathfind>");

_PARAMS._DIAGONALS = _PARAMS["Diagonals"];
_PARAMS._INTERVALS = _PARAMS["Intervals"];
_PARAMS._SMARTWAIT = _PARAMS["Smart Wait"];
_PARAMS._DASHONMOUSE = _PARAMS["Dash on Mouse"];
_PARAMS._ANYANGLE = _PARAMS["Any Angle"];

if (_PARAMS._ANYANGLE && typeof QMovement !== "undefined")
  _PARAMS._DIAGONALS = false;
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
    const chasing = QPlus.getCharacter(options.chase);
    if (!chasing) {
      return this.character().clearPathfind();
    }
    if (typeof QMovement !== "undefined") {
      endPoint = new Point(chasing.px, chasing.py);
    } else {
      endPoint = new Point(chasing.x, chasing.y);
    }
  }
  let startPoint;
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
  const x = this._endNode.x;
  const y = this._endNode.y;
  let canPass = true;
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
  const x1 = this._endNode.x;
  const y1 = this._endNode.y;
  let x2 = x1;
  let y2 = y1;
  let steps = 0;
  let horz = 0;
  let vert = 0;
  const maxDist = typeof QMovement !== "undefined" ? QMovement.tileSize : 1;
  const neighbors = [];
  const dirs = _PARAMS._DIAGONALS ? 9 : 5;
  for (let i = 1; i < dirs; i++) {
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
    const distx1 =
      typeof QMovement !== "undefined"
        ? Math.abs(this.character().px - x2)
        : Math.abs(this.character().x - x2);
    const distx2 = Math.abs(x1 - x2);
    const disty1 =
      typeof QMovement !== "undefined"
        ? Math.abs(this.character().py - y2)
        : Math.abs(this.character().y - y2);
    const disty2 = Math.abs(y1 - y2);
    const score = this.heuristic(
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
    let stepsPerFrame = this._intervals;
    if (this.options.towards) {
      stepsPerFrame = Math.min(stepsPerFrame, 100);
    }
    let ti;
    if (_PARAMS._SMARTINTERVAL) {
      ti = Date.now();
      stepsPerFrame = 20000; // random large num
    }
    for (let i = 0; i < stepsPerFrame; i++) {
      let chasing = null
      let oldThrough = null

      if (this.options.chase !== undefined) {
        chasing = QPlus.getCharacter(this.options.chase);
        oldThrough = chasing._through;
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
        const dt = Date.now() - ti;
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
  let ot = 0;
  if (!this._forceReq && this.options.chase !== undefined) {
    // TODO return if already touching the character it's chasing
    // TODO if character hasn't moved in X frames force a restart
    const chasing = QPlus.getCharacter(this.options.chase);
    const p1 = new Point(chasing.x, chasing.y);
    const p2 = new Point(this.character().x, this.character().y);
    const dist = this.heuristic(p1, p2);
    const range = 5;
    if (dist > range) {
      ot = _PARAMS._SMARTOT;
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
    const chasing = QPlus.getCharacter(this.options.chase);
    if (!chasing) return this.character().clearPathfind();
    const dx = chasing.cx() - this.character().cx();
    const dy = chasing.cy() - this.character().cy();
    const radian = Math.atan2(dy, dx);
    const x2 =
      this.character().px + Math.cos(radian) * this.character().moveTiles();
    const y2 =
      this.character().py + Math.sin(radian) * this.character().moveTiles();
    const colliderA = this.character().collider("collision");
    const colliderB = chasing.collider("collision");
    colliderA.moveTo(x2, y2);
    const collided = colliderA.intersects(colliderB);
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
  let node;
  const val = x + y * this._mapWidth;
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
  let currI = 0;
  let i, j;
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
  const neighbors = this.findNeighbors(this._current);
  j = neighbors.length;
  for (i = 0; i < j; i++) {
    if (this._closed[neighbors[i].value]) continue;
    const gScore = this._current.g + this.heuristic(this._current, neighbors[i]);
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
  const chara = this.character();
  const x = current.x;
  const y = current.y;
  const xf = this._endNode.x;
  const yf = this._endNode.y;
  const neighbors = [];
  let stepDist = 1;
  let tiles = null
  if (typeof QMovement !== "undefined") {
    stepDist = chara.moveTiles();
    const nearEnd =
      Math.abs(x - xf) < chara.optTiles() &&
      Math.abs(y - yf) < chara.optTiles();
      tiles = nearEnd ? chara.moveTiles() : chara.optTiles();
  }
  let i;
  const j = !typeof QMovement !== "undefined" && _PARAMS._DIAGONALS ? 8 : 4;
  const dirs = [2, 4, 6, 8, 1, 3, 7, 9];
  const diags = {
    1: [4, 2],
    3: [6, 2],
    7: [4, 8],
    9: [6, 8],
  };
  for (i = 0; i < j; i++) {
    const dir = dirs[i];
    let horz = dirs[i];
    let vert = dirs[i];
    if (i >= 4) {
      horz = diags[dir][0];
      vert = diags[dir][1];
    }
    let passed = false;
    const onEnd = false;

    let x2 = 0;
    let y2 = 0;

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
    const val = x2 + y2 * this._mapWidth;
    if (passed || val === this._endNode.value) {
      const node = this.getNodeAt(current, x2, y2);
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
    const firstSteps = this.createFinalPath().slice(0, 3);
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
  let node = this._current;
  const path = [node];
  while (node.parent) {
    let next = node.parent;
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
        const dx = node.x - next.parent.x;
        const dy = node.y - next.parent.y;
        let rad = Math.atan2(dy, dx);
        rad += rad < 0 ? Math.PI * 2 : 0;
        const deg = Math.floor((rad * 180) / Math.PI);
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
  const dx = Math.abs(initial.x - final.x);
  const dy = Math.abs(initial.y - final.y);
  if (!_PARAMS._DIAGONALS) {
    return dx + dy;
  } else {
    const D = 1;
    const D2 = Math.sqrt(2);
    return D * (dx + dy) + (D2 - 2 * D) * Math.min(dx, dy);
  }
};

// static
QPathfind.pathToRoute = function (chara, path) {
  const route = {
    list: [],
    repeat: false,
    skippable: false,
    wait: false,
  };
  let current = path[0];
  const codes = {
    2: 1,
    4: 2,
    6: 3,
    8: 4,
    1: 5,
    3: 6,
    7: 7,
    9: 8,
  };
  for (let i = 1; i < path.length; i++) {
    if (!path[i]) break;
    const sx = current.x - path[i].x;
    const sy = current.y - path[i].y;
    let dist = null
    let dir = null

    if (sx !== 0 && sy !== 0) {
      // diag
      const horz = sx > 0 ? 4 : 6;
      const vert = sy > 0 ? 8 : 2;
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
    const command = {};
    if (typeof QMovement !== "undefined") {
      if (_PARAMS._ANYANGLE && $gameMap.offGrid()) {
        let radian = Math.atan2(-sy, -sx);
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
