/**
 * @param  {arr} charas
 *               array of characters
 * @param  {int} mode
 *               0 - ignore characters in charas arr
 *               1 - only apply to charas in charas arr
 * @param  {int} level
 *               0 - clear lock
 *               1 - lock movement
 *               2 - lock movement and character animation
 */
Game_Map.prototype.globalLock = function (charas, mode, level) {
  charas = charas || [];
  mode = mode === undefined ? 0 : mode;
  level = level === undefined ? 1 : level;
  if (mode === 0) {
    $gamePlayer._globalLocked = !charas.contains($gamePlayer) ? level : 0;
    const events = this.events();
    for (let i = 0; i < events.length; i++) {
      if (charas.contains(events[i])) continue;
      events[i]._globalLocked = level;
    }
  } else {
    for (let i = 0; i < charas.length; i++) {
      if (charas[i]) {
        charas[i]._globalLocked = level;
      }
    }
  }
};

// kept for backwars compatibility
Game_Map.prototype.globalUnlock = function (charas) {
  this.globalLock(charas, 0, 0);
};

Game_Map.prototype.noTilemap = function () {
  return $dataMap.meta && !!$dataMap.meta.noTilemap;
};
