import Sprite_MapObject from "./Sprite_MapObject";

const Alias_Spriteset_Map_createCharacters =
  Spriteset_Map.prototype.createCharacters;
Spriteset_Map.prototype.createCharacters = function () {
  Alias_Spriteset_Map_createCharacters.call(this);
  this.createMapObjs();
};

Spriteset_Map.prototype.createMapObjs = function () {
  this._mapObjs = [];
  const mapObjs = $gameMap._mapObjs;
  for (const key in mapObjs) {
    for (let i = 0; i < mapObjs[key].length; i++) {
      if (!mapObjs[key][i] || !mapObjs[key][i].filePath) continue;
      this._mapObjs.push(new Sprite_MapObject(mapObjs[key][i]));
    }
  }
  for (let i = 0; i < this._mapObjs.length; i++) {
    this._tilemap.addChild(this._mapObjs[i]);
  }
};
