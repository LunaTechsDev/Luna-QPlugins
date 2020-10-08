var Alias_Game_CharacterBase_initMembers =
  Game_CharacterBase.prototype.initMembers;
Game_CharacterBase.prototype.initMembers = function () {
  Alias_Game_CharacterBase_initMembers.call(this);
  this._globalLocked = 0;
  this._comments = "";
  this._waitListeners = [];
  _QPlus.mixinWait(this);
};

Game_CharacterBase.prototype.charaId = function () {
  return -1;
};

Game_CharacterBase.prototype.notes = function () {
  return "";
};

Game_CharacterBase.prototype.canMove = function () {
  return this._globalLocked === 0;
};

/**
 * east is 0, north is 270, west is 180 and south is 90
 */
Game_CharacterBase.prototype.directionToRadian = function (dir) {
  dir = dir || this._direction;
  if (dir === 2) return Math.PI / 2;
  if (dir === 4) return Math.PI;
  if (dir === 6) return 0;
  if (dir === 8) return (Math.PI * 3) / 2;
  if (dir === 1) return (Math.PI * 3) / 4;
  if (dir === 3) return Math.PI / 4;
  if (dir === 7) return (Math.PI * 5) / 4;
  if (dir === 9) return (Math.PI * 7) / 4;
  return 0;
};

Game_CharacterBase.prototype.radianToDirection = function (radian, useDiag) {
  radian = _QPlus.adjustRadian(radian);
  if (useDiag) {
    // use degrees for diagonals
    // since I don't know clean PI numbers for these degrees
    var deg = (radian * 180) / Math.PI;
    if (deg >= 22.5 && deg <= 67.5) {
      return 3;
    } else if (deg >= 112.5 && deg <= 157.5) {
      return 1;
    } else if (deg >= 202.5 && deg <= 247.5) {
      return 7;
    } else if (deg >= 292.5 && deg <= 337.5) {
      return 9;
    }
  }
  if (radian >= 0 && radian < Math.PI / 4) {
    return 6;
  } else if (radian >= Math.PI / 4 && radian < (3 * Math.PI) / 4) {
    return 2;
  } else if (radian >= (Math.PI * 3) / 4 && radian < (Math.PI * 5) / 4) {
    return 4;
  } else if (radian >= (Math.PI * 5) / 4 && radian < (Math.PI * 7) / 4) {
    return 8;
  } else if (radian >= (Math.PI * 7) / 4) {
    return 6;
  }
};

Game_CharacterBase.prototype.setSelfSwitch = function () {
  return;
};

var Alias_Game_CharacterBase_updateAnimation =
  Game_CharacterBase.prototype.updateAnimation;
Game_CharacterBase.prototype.updateAnimation = function () {
  if (this._globalLocked >= 2) {
    return;
  }
  Alias_Game_CharacterBase_updateAnimation.call(this);
};

var Alias_Game_CharacterBase_updateMove =
  Game_CharacterBase.prototype.updateMove;
Game_CharacterBase.prototype.updateMove = function () {
  if (this._globalLocked >= 1) {
    return;
  }
  Alias_Game_CharacterBase_updateMove.call(this);
};

var Alias_Game_Character_updateRoutineMove =
  Game_Character.prototype.updateRoutineMove;
Game_Character.prototype.updateRoutineMove = function () {
  if (this._globalLocked >= 1) {
    return;
  }
  Alias_Game_Character_updateRoutineMove.call(this);
};
