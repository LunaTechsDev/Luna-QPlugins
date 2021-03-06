import QMovement from "./QMovement";
import ColliderManager from "./ColliderManager";
import Polygon_Collider from "./colliders/Polygon_Collider";
import Box_Collider from "./colliders/Box_Collider";
import Circle_Collider from "./colliders/Circle_Collider";
import Sprite_Collider from "./colliders/Sprite_Collider";

import "./objects/Game_Character";
import "./objects/Game_CharacterBase";
import "./objects/Game_Event";
import "./objects/Game_Interpreter";
import "./objects/Game_Map";
import "./objects/Game_Party";
import "./objects/Game_Player";
import "./objects/Game_System";
import "./objects/Game_Temp";

import "./scenes/Scene_Map";
import "./sprites/Sprite_Destination";
import "./sprites/Spriteset_Map";

if (typeof QPlus === "undefined") {
  alert("Error: QMovement requires QPlus 1.6.0 or newer to work.");
  throw new Error("Error: QMovement requires QPlus 1.6.0 or newer to work.");
}

export default {
  ColliderManager,
  Polygon_Collider,
  Box_Collider,
  Circle_Collider,
  Sprite_Collider,
  ...QMovement,
};

ColliderManager.setup();

if (Utils.RPGMAKER_NAME === "MZ") {
  PluginManager.registerCommand("Luna_QMovement", "transfer", (args) => {
    let { dir = 0, fade = "black" } = args;
    const mapId = Number(args.mapId);
    const x = Number(args.x) / QMovement.tileSize;
    const y = Number(args.y) / QMovement.tileSize;
    dir = QPlus.stringToType(dir);
    if (fade) {
      if (fade.toLowerCase() === "black") {
        fade = 0;
      } else if (args.fade.toLowerCase() === "white") {
        fade = 1;
      } else {
        fade = 3;
      }
    }
    $gamePlayer.reserveTransfer(mapId, x, y, dir, fade);
    return;
  });

  PluginManager.registerCommand("Luna_QMovement", "setPosition", (args) => {
    let { dir = 0 } = args;
    let chara = null;
    if (args.charId.toLowerCase() === "this") {
      chara = this.character(0);
    } else {
      chara = QPlus.getCharacter(args.charId);
    }
    if (!chara) return;
    const x = Number(args.x) / QMovement.tileSize;
    const y = Number(args.y) / QMovement.tileSize;
    dir = Number(args.dir);
    chara.locate(x, y);
    if (dir > 0) {
      chara.setDirection(dir);
    }
  });

  PluginManager.registerCommand("Luna_QMovement", "changeCollider", (args) => {
    if (args.charId === `"0"`) {
      args.charId = 0;
    }
    const chara = QPlus.getCharacter(args.charId);
    if (!chara) return;
    const type = args.type;
    chara.changeCollider(type, [
      args.shape,
      Number(args.width),
      Number(args.height),
      Number(args.ox),
      Number(args.oy),
    ]);
  });
}
