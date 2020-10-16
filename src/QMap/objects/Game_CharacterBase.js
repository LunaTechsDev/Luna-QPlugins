if (typeof QMovement === "undefined") {
  const Alias_Game_CharacterBase_isCollidedWithCharacters =
    Game_CharacterBase.prototype.isCollidedWithCharacters;
  Game_CharacterBase.prototype.isCollidedWithCharacters = function (x, y) {
    return (
      Alias_Game_CharacterBase_isCollidedWithCharacters.call(this, x, y) ||
      this.isCollidedWithMapObj(x, y)
    );
  };

  Game_CharacterBase.prototype.isCollidedWithMapObj = function (x, y) {
    const mapObjs = $gameMap._mapObjsWithColliders;
    return mapObjs.some(function (mapObj) {
      return mapObj.intersectsWithSimple("collision", x, y);
    });
  };
}
