import { $dataQMap } from "../constants";

const Alias_Game_Interpreter_pluginCommand =
  Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function (command, args) {
  if (command.toLowerCase() === "qmap") {
    return this.qMapCommand(QPlus.makeArgs(args));
  }
  Alias_Game_Interpreter_pluginCommand.call(this, command, args);
};

Game_Interpreter.prototype.qMapCommand = function (args) {
  if (!$dataQMap || $dataQMap.length === 0) {
    return;
  }
  const objName = args.shift();
  const cmd = args.shift();
  const mapObjs = $gameMap._mapObjs[objName];
  if (!mapObjs) return;
  for (let i = 0; i < mapObjs.length; i++) {
    const mapObj = mapObjs[i];
    switch (cmd.toLowerCase()) {
      case "alpha": {
        mapObj.alpha = args[0];
        break;
      }
      case "scale": {
        mapObj.scale = new Point(args[0], args[1]);
        break;
      }
      case "rotation": {
        mapObj.rotation = args[0] * (Math.PI / 180);
        break;
      }
      case "animate": {
        mapObj.requestAnimate(args[0] || "loop", args[1] || 1);
        break;
      }
    }
  }
};
