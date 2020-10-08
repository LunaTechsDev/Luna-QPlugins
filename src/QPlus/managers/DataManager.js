import { _PARAMS } from "../constants";

const Alias_DataManager_setupNewGame = DataManager.setupNewGame;
DataManager.setupNewGame = function () {
  Alias_DataManager_setupNewGame.call(this);
  for (let i = 0; i < _PARAMS["Default Enabled Switches"].length; i++) {
    $gameSwitches.setValue(_PARAMS["Default Enabled Switches"][i], true);
  }
};

let reading = null;
const Alias_DataManager_onLoad = DataManager.onLoad;
DataManager.onLoad = function (object) {
  reading = object;
  Alias_DataManager_onLoad.call(this, object);
  reading = null;
};

const Alias_DataManager_extractMetadata = DataManager.extractMetadata;
DataManager.extractMetadata = function (data) {
  Alias_DataManager_extractMetadata.call(this, data);
  const blockRegex = /<([^<>:\/]+)>([\s\S]*?)<\/\1>/g;
  data.qmeta = Object.assign({}, data.meta);
  while (true) {
    const match = blockRegex.exec(data.note);
    if (match) {
      data.qmeta[match[1]] = match[2];
    } else {
      break;
    }
  }
  this.extractQData(data, reading);
};

DataManager.extractQData = function (data, object) {
  // to be aliased by plugins
};
