import QPlus from "../QPlus";

const Alias_Game_Interpreter_pluginCommand =
  Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function (command, args) {
  if (this.QPlusCommand(command, QPlus.makeArgs(args))) {
    return;
  }
  Alias_Game_Interpreter_pluginCommand.call(this, command, args);
};

Game_Interpreter.prototype.QPlusCommand = function (command, args) {
  if (command.toLowerCase() === "wait") {
    let min = Number(args[0]);
    let max = Number(args[1]);
    if (!max) {
      max = min;
      min = 0;
    }
    const wait = Math.randomIntBetween(min, max);
    this.wait(wait);
    return true;
  }
  if (command.toLowerCase() === "globallock") {
    const level = Number(args[0]);
    const args2 = args.slice(1);
    const only = args2.indexOf("only");
    if (only !== -1) args2.splice(only, 1);
    const charas = args2.map(QPlus.getCharacter);
    const mode = only !== -1 ? 1 : 0;
    $gameMap.globalLock(charas, mode, level);
    return true;
  }
  return false;
};
