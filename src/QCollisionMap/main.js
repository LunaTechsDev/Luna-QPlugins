if (typeof QMovement === "undefined") {
  alert("Error: QM+CollisionMap requires QMovement 1.0.2 or newer to work.");
  throw new Error(
    "Error: QM+CollisionMap requires QMovement 1.0.2 or newer to work."
  );
}

import "./ColliderManager";
import "./objects/Game_CharacterBase";
import "./objects/Game_Map";
import "./objects/Game_Temp";
import "./core/Bitmap";

export const _PARAMS = QPlus.getParams("<Luna_QMCollisionMap>", true);
export const _CMFOLDER = _PARAMS["Folder"];
export const _SCANSIZE = _PARAMS["Scan Size"];
