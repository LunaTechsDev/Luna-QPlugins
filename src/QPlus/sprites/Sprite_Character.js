const Alias_Sprite_Character_updatePosition =
  Sprite_Character.prototype.updatePosition;
Sprite_Character.prototype.updatePosition = function () {
  const prevY = this.y;
  const prevZ = this.z;
  Alias_Sprite_Character_updatePosition.call(this);
  if (this.y !== prevY || this.z !== prevZ) {
    if ($gameMap.noTilemap && this.parent && this.parent.requestSort) {
      this.parent.requestSort();
    }
  }
};
