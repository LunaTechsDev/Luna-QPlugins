import QPlus from "./QPlus";
import SimpleTilemap from "./core/SimpleTilemap";

import "./core/Input";
import "./core/TouchInput";
import "./core/Math";
import "./managers/DataManager";
import "./managers/SceneManager";
import "./objects/Game_CharacterBase";
import "./objects/Game_Event";
import "./objects/Game_Map";
import "./objects/Game_Temp";
import "./objects/Game_Interpreter";
import "./scenes/Scene_Base";
import "./scenes/Scene_Boot";
import "./sprites/Sprite_Character";
import "./sprites/Spriteset_Map";

export default { ...QPlus, SimpleTilemap };

//-----------------------------------------------------------------------------
// Get _QPlus params

var _PARAMS = _QPlus.getParams("<Luna_QPlus>", {
  "Quick Test": false,
  "Default Enabled Switches": [],
  "Ignore Mouse when inactive": false,
});

//-----------------------------------------------------------------------------
// Document body

document.body.ondrop = function (e) {
  e.preventDefault();
  return false;
};

document.body.ondragover = function (e) {
  e.preventDefault();
  return false;
};

if (Utils.RPGMAKER_NAME === "MZ") {
  PluginManager.registerCommand("Luna_QPlus", "wait", (args) => {
    var min = Number(args.min);
    var max = Number(args.max);
    if (!max) {
      max = min;
      min = 0;
    }

    var waitTime = Math.randomIntBetween(min, max);
    // @todo probably a much better way to do this
    $gameMap._interpreter.wait(waitTime);
  });
}
