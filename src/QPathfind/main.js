if (typeof QMovement === "undefined") {
  alert("Error: Luna_QPathfind requires Luna_QMovement to work.");
  throw new Error("Error: Luna_QPathfind requires Luna_QMovement to work");
}

import QPathfind from './QPathfind'
import './objects/Game_CharacterBase'
import './objects/Game_Character'
import './objects/Game_Map'
import './objects/Game_Player'
import './objects/Game_Interpreter'
import './objects/Game_System'