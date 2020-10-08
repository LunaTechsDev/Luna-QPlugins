import { _PARAMS } from "../constants";

const Alias_Scene_Boot_startNormalGame = Scene_Boot.prototype.startNormalGame;

Scene_Boot.prototype.startNormalGame = function () {
  if (_PARAMS["Quick Test"] && Utils.isOptionValid("test")) {
    Scene_Base.prototype.start.call(this);
    this.checkPlayerLocation();
    DataManager.setupNewGame();
    SceneManager.goto(Scene_Map);
  } else {
    Alias_Scene_Boot_startNormalGame.call(this);
  }
};
