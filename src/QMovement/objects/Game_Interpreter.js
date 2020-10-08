var Alias_Game_Interpreter_pluginCommand =
  Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function (command, args) {
  if (command.toLowerCase() === "qmovement") {
    return this.qMovementCommand(QPlus.makeArgs(args));
  }
  Alias_Game_Interpreter_pluginCommand.call(this, command, args);
};

Game_Interpreter.prototype.qMovementCommand = function (args) {
  var cmd = args.shift().toLowerCase();
  if (cmd === "changecollider") {
    var chara = QPlus.getCharacter(args[0]);
    if (!chara) return;
    var type = args[1];
    var data = args.slice(2).map(QPlus.stringToType);
    chara.changeCollider(type, data);
    return;
  }
  if (cmd === "transfer") {
    var mapId = Number(args[0]);
    var x = Number(args[1]) / QMovement.tileSize;
    var y = Number(args[2]) / QMovement.tileSize;
    var dir = Number(QPlus.getArg(args, /^dir(\d+)$/i)) || 0;
    var fade = QPlus.getArg(args, /fade(black|white)/i) || "none";
    if (fade.toLowerCase() === "black") {
      fade = 0;
    } else if (fade.toLowerCase() === "white") {
      fade = 1;
    } else {
      fade = 3;
    }
    $gamePlayer.reserveTransfer(mapId, x, y, dir, fade);
    return;
  }
  if (cmd === "setpos") {
    var chara;
    if (args[0].toLowerCase() === "this") {
      chara = this.character(0);
    } else {
      chara = QPlus.getCharacter(args[0]);
    }
    if (!chara) return;
    var x = Number(args[1]) / QMovement.tileSize;
    var y = Number(args[2]) / QMovement.tileSize;
    var dir = Number(QPlus.getArg(args, /^dir(\d+)$/i)) || 0;
    chara.locate(x, y);
    if (dir > 0) {
      chara.setDirection(dir);
    }
    return;
  }
};
