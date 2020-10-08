var Alias_Spriteset_Map_createTilemap = Spriteset_Map.prototype.createTilemap;
Spriteset_Map.prototype.createTilemap = function () {
  if ($gameMap.noTilemap()) {
    this._tilemap = new SimpleTilemap();
    this._baseSprite.addChild(this._tilemap);
  } else {
    Alias_Spriteset_Map_createTilemap.call(this);
  }
};

var Alias_Spriteset_Map_loadTileset = Spriteset_Map.prototype.loadTileset;
Spriteset_Map.prototype.loadTileset = function () {
  if (!$gameMap.noTilemap()) {
    Alias_Spriteset_Map_loadTileset.call(this);
  }
};

var Alias_Spriteset_Map_updateTilemap = Spriteset_Map.prototype.updateTilemap;
Spriteset_Map.prototype.updateTilemap = function () {
  if (!$gameMap.noTilemap()) {
    Alias_Spriteset_Map_updateTilemap.call(this);
  }
};
