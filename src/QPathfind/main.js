if (typeof QMovement === "undefined") {
  alert("Error: Luna_QPathfind requires Luna_QMovement to work.");
  throw new Error("Error: Luna_QPathfind requires Luna_QMovement to work");
}

import QPathfind from "./QPathfind";
import "./objects/Game_CharacterBase";
import "./objects/Game_Character";
import "./objects/Game_Map";
import "./objects/Game_Player";
import "./objects/Game_System";

import "./objects/Game_Interpreter";


function deepParse(parameters) {
  function parse(string) {
    try {
      return JSON.parse(string, (key, value) => {
        try {
          return parse(value);
        } catch (e) {
          return value;
        }
      });
    } catch (e) {
      return string;
    }
  }

  return parse(JSON.stringify(parameters));
}
// qPathfind CHARAID X Y
// qPathfind CHARAID chase CHARAID2
// qPathfind CHARAID clear

//#if !_MV
PluginManager.registerCommand("Luna_QPathfind", "move", function (args) {
  const tileSize = QMovement.tileSize;
  const params = deepParse(args);
  const char =
    params.charId === "this"
      ? this.character(0)
      : QPlus.getCharacter(params.charId);

  const isPixel = params.isPixel;
  const x = isPixel ? params.x : params.x * tileSize;
  const y = isPixel ? params.y : params.y * tileSize;

  if (!char) {
    return;
  }

  char.initPathfind(x, y, {
    adjustEnd: true,
  });
});

PluginManager.registerCommand("Luna_QPathfind", "chase", function (args) {
  const tileSize = QMovement.tileSize;
  const params = deepParse(args);
  const char =
    params.charId === "this"
      ? $gameMap.event(this._eventId)
      : QPlus.getCharacter(params.charId);

  const target = QPlus.getCharacter(params.target);
  const x = isPixel ? params.x : params.x * tileSize;
  const y = isPixel ? params.y : params.y * tileSize;
  const isPixel = params.isPixel;

  if (!char) {
    return;
  }

  char.initChase(target);
});

PluginManager.registerCommand("Luna_QPathfind", "clear", function (args) {
  const params = deepParse(args);
  const char =
    params.charId === "this"
      ? $gameMap.event(this._eventId)
      : QPlus.getCharacter(params.charId);

  char.clearPathfind();
});
//#endif
