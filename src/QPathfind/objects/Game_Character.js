import QPathfind from "../QPathfind";

// if using QMovement, x and y are pixel values
Game_Character.prototype.initPathfind = function (x, y, options) {
  if (!this.isSamePathfind(x, y, options)) {
    return;
  }
  if (this._isPathfinding) {
    this.clearPathfind();
  }
  options = options || {};
  this._isChasing = options.chase !== undefined ? options.chase : false;
  this._pathfind = new QPathfind(this.charaId(), new Point(x, y), options);
};

Game_Character.prototype.initChase = function (charaId) {
  if (this.charaId() === charaId) return;
  if (!QPlus.getCharacter(charaId)) return;
  if (this._isChasing === charaId) return;
  this.initPathfind(0, 0, {
    smart: 2,
    chase: charaId,
    adjustEnd: true,
    //towards: true
  });
};

Game_Character.prototype.isSamePathfind = function (x, y, options) {
  if (!this._pathfind) {
    return true;
  }
  if (options.chase !== undefined) {
    return options.chase !== this._isChasing;
  }
  var oldX1 = this._pathfind._originalEnd.x;
  var oldY1 = this._pathfind._originalEnd.y;
  var oldX2 = this._pathfind._endNode.x;
  var oldY2 = this._pathfind._endNode.y;
  if ((x === oldX1 && y === oldY1) || (x === oldX2 && y === oldY2)) {
    return false;
  }
  return true;
};

Game_Character.prototype.restartPathfind = function () {
  if (!this._pathfind._completed) return;
  var x = this._pathfind._endNode.x;
  var y = this._pathfind._endNode.y;
  this._isPathfinding = false;
  if (this._moveRoute) {
    this.processRouteEnd();
  }
  var options = this._pathfind.options;
  this._isChasing = options.chase !== undefined ? options.chase : false;
  this._pathfind = new QPathfind(this.charaId(), new Point(x, y), options);
};

Game_Character.prototype.startPathfind = function (path) {
  this._isPathfinding = true;
  this.forceMoveRoute(QPathfind.pathToRoute(this, path));
};

Game_Character.prototype.onPathfindComplete = function () {
  if (this._isChasing !== false) {
    var chara = QPlus.getCharacter(this._isChasing);
    if (chara) {
      this._isPathfinding = false;
      this.processRouteEnd();
      this._pathfind.requestRestart(5);
      this.turnTowardCharacter(chara);
      return;
    } else {
      this._isChasing = false;
    }
  }
  this._isPathfinding = false;
  this._pathfind = null;
};

Game_Character.prototype.clearPathfind = function () {
  this._pathfind = null;
  this._isChasing = false;
  if (this._isPathfinding) {
    this.processRouteEnd();
  }
};

var Alias_Game_Character_processRouteEnd =
  Game_Character.prototype.processRouteEnd;
Game_Character.prototype.processRouteEnd = function () {
  Alias_Game_Character_processRouteEnd.call(this);
  if (this._isPathfinding) {
    this.onPathfindComplete();
  }
};

var Alias_Game_Character_isMoveRouteForcing =
  Game_Character.prototype.isMoveRouteForcing;
Game_Character.prototype.isMoveRouteForcing = function () {
  if (this._isPathfinding && this._pathfind.options.breakable) {
    return false;
  }
  return Alias_Game_Character_isMoveRouteForcing.call(this);
};

var Alias_Game_Character_advanceMoveRouteIndex =
  Game_Character.prototype.advanceMoveRouteIndex;
Game_Character.prototype.advanceMoveRouteIndex = function () {
  if (this._isPathfinding) {
    var moveRoute = this._moveRoute;
    if (
      moveRoute &&
      !this.isMovementSucceeded() &&
      this._pathfind.options.smart > 0
    ) {
      this._isPathfinding = false;
      this.processRouteEnd();
      this._pathfind.requestRestart(2);
      return;
    }
  }
  Alias_Game_Character_advanceMoveRouteIndex.call(this);
};
