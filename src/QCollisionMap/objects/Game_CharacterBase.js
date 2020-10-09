const Alias_Game_CharacterBase_collisionCheck =
  Game_CharacterBase.prototype.collisionCheck;
Game_CharacterBase.prototype.collisionCheck = function (x, y, dir, dist, type) {
  const canPass = Alias_Game_CharacterBase_collisionCheck.call(
    this,
    x,
    y,
    dir,
    dist,
    type
  );
  if (this.isThrough() || this.isDebugThrough()) return true;
  if (!canPass) return false;
  if (this.collideWithCollisionMap(type, dir)) return false;
  return true;
};

//TODO add to midpass

Game_CharacterBase.prototype.collideWithCollisionMap = function (type, dir) {
  if (!$gameMap._hasCM) return false;
  const collider = this.collider(type);
  const edge = {
    2: "bottom",
    4: "left",
    6: "right",
    8: "top",
  };
  const passableColors = this.passableColors();
  if (dir === 5) {
    if (
      !$gameMap.collisionMapPass(collider, "top", passableColors) ||
      !$gameMap.collisionMapPass(collider, "bottom", passableColors) ||
      !$gameMap.collisionMapPass(collider, "left", passableColors) ||
      !$gameMap.collisionMapPass(collider, "right", passableColors)
    ) {
      return true;
    }
  } else {
    return !$gameMap.collisionMapPass(collider, edge[dir], passableColors);
  }
  return false;
};
