import QPlus from "../QPlus";

var Alias_SceneManager_updateManagers = SceneManager.updateManagers;
SceneManager.updateManagers = function () {
  Alias_SceneManager_updateManagers.call(this);
  QPlus.update();
};
