var Alias_SceneManager_updateManagers = SceneManager.updateManagers;
SceneManager.updateManagers = function () {
  Alias_SceneManager_updateManagers.call(this);
  _QPlus.update();
};
