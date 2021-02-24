//-----------------------------------------------------------------------------
// Game_Interpreter

var Alias_Game_Interpreter_updateWaitMode =
  Game_Interpreter.prototype.updateWaitMode;
Game_Interpreter.prototype.updateWaitMode = function () {
  var waiting = false;
  if (this._waitMode === "pathfind") {
    waiting = this._character._pathfind || this._character._isPathfinding;
    if (!waiting) {
      this._waitMode = "";
    }
  }
  return waiting || Alias_Game_Interpreter_updateWaitMode.call(this);
};

var Alias_Game_Interpreter_pluginCommand =
  Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function (command, args) {
  if (command.toLowerCase() === "qpathfind") {
    return this.qPathfindCommand(QPlus.makeArgs(args));
  }
  Alias_Game_Interpreter_pluginCommand.call(this, command, args);
};

Game_Interpreter.prototype.qPathfindCommand = function (args) {
  // qPathfind CHARAID X Y
  // qPathfind CHARAID chase CHARAID2
  // qPathfind CHARAID clear
  var chara;
  if (args[0].toLowerCase() === "this") {
    chara = this.character(0);
  } else {
    chara = QPlus.getCharacter(args[0]);
  }
  if (!chara) return;
  var args2 = args.slice(1);
  if (args2[0].toLowerCase() === "chase") {
    if (args2[1].toLowerCase() === "this") {
      chara.initChase(this.character(0).charaId());
    } else if (QPlus.getCharacter(args2[1])) {
      chara.initChase(QPlus.getCharacter(args2[1]).charaId());
    }
    return;
  }
  if (args2[0].toLowerCase() === "clear") {
    chara.clearPathfind();
    return;
  }
  var x;
  var y;
  if (args2[0].toLowerCase() === "towards") {
    var chara2;
    if (args2[1].toLowerCase() === "this") {
      chara2 = this.character(0);
    } else {
      chara2 = QPlus.getCharacter(args2[1]);
    }
    if (typeof QMovement !== "undefined") {
      var pos = chara.centerWith(chara2);
      x = pos.x;
      y = pos.y;
    } else {
      x = chara2.x;
      y = chara2.y;
    }
  } else {
    x = QPlus.getArg(args2, /^x(\d+)/i);
    y = QPlus.getArg(args2, /^y(\d+)/i);
    if (typeof QMovement !== "undefined") {
      if (x === null) {
        x = QPlus.getArg(args2, /^px(\d+)/i);
      } else {
        x = Number(x) * QMovement.tileSize;
      }
      if (y === null) {
        y = QPlus.getArg(args2, /^py(\d+)/i);
      } else {
        y = Number(y) * QMovement.tileSize;
      }
    }
  }
  if (x === null && y === null) return;
  chara.initPathfind(Number(x), Number(y), {
    smart: Number(QPlus.getArg(args2, /^smart(\d+)/i)),
    adjustEnd: true,
  });
  var wait = QPlus.getArg(args2, /^wait$/i);
  if (wait) {
    this._character = chara;
    this.setWaitMode("pathfind");
  }
};
