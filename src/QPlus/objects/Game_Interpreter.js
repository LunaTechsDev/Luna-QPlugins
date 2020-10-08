var Alias_Game_Interpreter_pluginCommand =
  Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function (command, args) {
  if (this._QPlusCommand(command, _QPlus.makeArgs(args))) {
    return;
  }
  Alias_Game_Interpreter_pluginCommand.call(this, command, args);
};

Game_Interpreter.prototype._QPlusCommand = function (command, args) {
  if (command.toLowerCase() === "wait") {
    var min = Number(args[0]);
    var max = Number(args[1]);
    if (!max) {
      max = min;
      min = 0;
    }
    var wait = Math.randomIntBetween(min, max);
    this.wait(wait);
    return true;
  }
  if (command.toLowerCase() === "globallock") {
    var level = Number(args[0]);
    var args2 = args.slice(1);
    var only = args2.indexOf("only");
    if (only !== -1) args2.splice(only, 1);
    var charas = args2.map(_QPlus.getCharacter);
    var mode = only !== -1 ? 1 : 0;
    $gameMap.globalLock(charas, mode, level);
    return true;
  }
  return false;
};
