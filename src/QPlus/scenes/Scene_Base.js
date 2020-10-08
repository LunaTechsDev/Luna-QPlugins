import QPlus from "../QPlus";

var Alias_Scene_Base_initialize = Scene_Base.prototype.initialize;
Scene_Base.prototype.initialize = function () {
  Alias_Scene_Base_initialize.call(this);
  this._waitListeners = [];
  if (this.mixinWait()) {
    QPlus.mixinWait(this);
  }
};

Scene_Base.prototype.mixinWait = function () {
  // In your own scene, have this return true to be able to
  // use the .wait(duration, callback) function
  return false;
};
