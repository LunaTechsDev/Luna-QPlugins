import Game_MapObj from "./Game_MapObj";
import { getQMapData } from "../constants";

const Alias_Game_Map_initialize = Game_Map.prototype.initialize;
Game_Map.prototype.initialize = function () {
  Alias_Game_Map_initialize.call(this);
  this._mapObjs = [];
};

const Alias_Game_Map_setupEvents = Game_Map.prototype.setupEvents;
Game_Map.prototype.setupEvents = function () {
  Alias_Game_Map_setupEvents.call(this);
  this.setupMapObjs();
};

if (typeof QMovement !== "undefined") {
  const Alias_Game_Map_reloadColliders = Game_Map.prototype.reloadColliders;
  Game_Map.prototype.reloadColliders = function () {
    Alias_Game_Map_reloadColliders.call(this);
    for (const key in this._mapObjs) {
      for (let i = 0; i < this._mapObjs[key].length; i++) {
        if (this._mapObjs[key][i]) {
          this._mapObjs[key][i].reloadColliders();
        }
      }
    }
  };

  const Alias_Game_Map_clearColliders = Game_Map.prototype.clearColliders;
  Game_Map.prototype.clearColliders = function () {
    Alias_Game_Map_clearColliders.call(this);
    for (const key in this._mapObjs) {
      for (let i = 0; i < this._mapObjs[key].length; i++) {
        if (this._mapObjs[key][i]) {
          this._mapObjs[key][i].removeColliders();
        }
      }
    }
  };
}

Game_Map.prototype.setupMapObjs = function () {
  this._mapObjs = {};
  this._mapObjsWithColliders = [];
  const data = getQMapData() || [];
  for (let i = 0; i < data.length; i++) {
    if (data[i]) {
      const objData = JSON.parse(JSON.stringify(data[i]));
      const mapObj = new Game_MapObj(this._mapId, objData);
      const name = mapObj.name;
      if (!this._mapObjs[name]) {
        this._mapObjs[name] = [];
      }
      this._mapObjs[name].push(mapObj);
      if (mapObj.collider("collision")) {
        this._mapObjsWithColliders.push(mapObj);
      }
    }
  }
};

const Alias_Game_Map_updateEvents = Game_Map.prototype.updateEvents;
Game_Map.prototype.updateEvents = function () {
  Alias_Game_Map_updateEvents.call(this);
  this.updateMapObjs();
};

Game_Map.prototype.updateMapObjs = function () {
  for (const key in this._mapObjs) {
    for (let i = 0; i < this._mapObjs[key].length; i++) {
      if (this._mapObjs[key][i]) {
        this._mapObjs[key][i].update();
      }
    }
  }
};
