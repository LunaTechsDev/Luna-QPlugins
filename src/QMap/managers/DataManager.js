import { getQMapData, getQMapInfos, setQMapData } from "../constants";

const Alias_DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
DataManager.isDatabaseLoaded = function () {
  return Alias_DataManager_isDatabaseLoaded.call(this) && getQMapInfos();
};

const Alias_DataManager_isMapLoaded = DataManager.isMapLoaded;
DataManager.isMapLoaded = function () {
  return Alias_DataManager_isMapLoaded.call(this) && !!$dataQMap;
};

const Alias_DataManager_loadMapData = DataManager.loadMapData;
DataManager.loadMapData = function (mapId) {
  Alias_DataManager_loadMapData.call(this, mapId);
  if (mapId > 0) {
    if (getQMapInfos()[mapId]) {
      setQMapData(null);
      const filename = "QMap%1.json".format(mapId.padZero(3));
      QPlus.request("data/QMaps/" + filename)
        .onSuccess(function (json) {
          setQMapData(json);
          DataManager.onLoad($dataQMap);
        })
        .onError(function () {
          throw new Error("Failed to load 'data/QMaps" + filename + "'");
        });
    } else {
      setQMapData([]);
    }
  }
};

const Alias_DataManager_onLoad = DataManager.onLoad;
DataManager.onLoad = function (object) {
  if (object === getQMapData()) {
    for (let i = 0; i < object.length; i++) {
      const data = object[i];
      if (data.note === undefined && data.notes !== undefined) {
        // older version the property was name notes, should
        // have been just note
        data.note = data.notes;
      }
      if (data && data.note !== undefined) {
        this.extractMetadata(data);
      }
    }
  } else {
    Alias_DataManager_onLoad.call(this, object);
  }
};
