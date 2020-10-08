import { _PARAMS } from "../constants";

//#if _MV
const Alias_Scene_Boot_start = Scene_Boot.prototype.start;
Scene_Boot.prototype.start = function () {
  if (DataManager.isBattleTest() || DataManager.isEventTest()) {
    Alias_Scene_Boot_start.call(this);
  } else if (_PARAMS["Quick Test"] && Utils.isOptionValid("test")) {
    Scene_Base.prototype.start.call(this);
    SoundManager.preloadImportantSounds();
    this.checkPlayerLocation();
    DataManager.setupNewGame();
    SceneManager.goto(Scene_Map);
    this.updateDocumentTitle();
  } else {
    Alias_Scene_Boot_start.call(this);
  }
};

//#else
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
//#endif
