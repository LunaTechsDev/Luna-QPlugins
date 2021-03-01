//-----------------------------------------------------------------------------
// Game_CharacterBase

const Alias_Game_CharacterBase_initMembers =
  Game_CharacterBase.prototype.initMembers;
Game_CharacterBase.prototype.initMembers = function () {
  Alias_Game_CharacterBase_initMembers.call(this);
  this._pathfind = null;
  this._isPathfinding = false;
  this._isChasing = false;
};

const Alias_Game_CharacterBase_update = Game_CharacterBase.prototype.update;
Game_CharacterBase.prototype.update = function () {
  Alias_Game_CharacterBase_update.call(this);
  if (this._pathfind) {
    this._pathfind.update();
  }
};

const Alias_Game_CharacterBase_setPosition =
  Game_CharacterBase.prototype.setPosition;
Game_CharacterBase.prototype.setPosition = function (x, y) {
  Alias_Game_CharacterBase_setPosition.call(this, x, y);
  if (this._pathfind) {
    this.clearPathfind();
  }
};

if (typeof QMovement !== "undefined") {
  const Alias_Game_CharacterBase_ignoreCharacters =
    Game_CharacterBase.prototype.ignoreCharacters;
  Game_CharacterBase.prototype.ignoreCharacters = function (type) {
    const ignores = Alias_Game_CharacterBase_ignoreCharacters.call(this, type);
    if (this._isChasing !== false && type === "_pathfind") {
      ignores.push(Number(this._isChasing));
    }
    return ignores;
  };

  Game_CharacterBase.prototype.optTiles = function () {
    if (!$gameMap.offGrid()) {
      return this.moveTiles();
    }
    if (!this._optTiles) {
      let w = Math.round(this.collider("collision").width);
      let h = Math.round(this.collider("collision").height);
      while (w % this.moveTiles() !== 0) {
        w--;
        if (w <= this.moveTiles()) break;
      }
      while (h % this.moveTiles() !== 0) {
        h--;
        if (h <= this.moveTiles()) break;
      }
      this._optTiles = Math.max(Math.min(w, h), this.moveTiles());
    }
    return this._optTiles;
  };

  const Alias_Game_CharacterBase_setupColliders =
    Game_CharacterBase.prototype.setupColliders;
  Game_CharacterBase.prototype.setupColliders = function () {
    Alias_Game_CharacterBase_setupColliders.call(this);
    const collider = this.collider("collision");
    // this._colliders["_pathfind"] = JsonEx.parse(JsonEx.stringify(collider));
    this._optTiles = null;
  };
}
