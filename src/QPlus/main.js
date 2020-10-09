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
// Document body

document.body.ondrop = function (e) {
  e.preventDefault();
  return false;
};

document.body.ondragover = function (e) {
  e.preventDefault();
  return false;
};

//#if !_MV
PluginManager.registerCommand("Luna_QPlus", "wait", (args) => {
  let min = Number(args.min);
  let max = Number(args.max);
  if (!max) {
    max = min;
    min = 0;
  }

  const waitTime = Math.randomIntBetween(min, max);
  // @todo probably a much better way to do this
  $gameMap._interpreter.wait(waitTime);
});
//#endif
