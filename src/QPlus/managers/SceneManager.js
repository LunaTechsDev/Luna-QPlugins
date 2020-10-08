import QPlus from "../QPlus";

const Alias_SceneManager_updateManagers = SceneManager.updateManagers;
SceneManager.updateManagers = function () {
  Alias_SceneManager_updateManagers.call(this);
  QPlus.update();
};
