if (typeof QPlus === "undefined") {
  alert("Error: QMovement requires QPlus 1.6.0 or newer to work.");
  throw new Error("Error: QMovement requires QPlus 1.6.0 or newer to work.");
}

if (Utils.RPGMAKER_NAME === "MZ") {
  PluginManager.registerCommand("Luna_QMovement", "transfer", (args) => {
    var { dir = 0, fade = "black" } = args;
    var mapId = Number(args.mapId);
    var x = Number(args.x) / QMovement.tileSize;
    var y = Number(args.y) / QMovement.tileSize;
    var dir = QPlus.stringToType(dir);
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
    var { dir = 0 } = args;
    var chara = null;
    if (args.charId.toLowerCase() === "this") {
      chara = this.character(0);
    } else {
      chara = QPlus.getCharacter(args.charId);
    }
    if (!chara) return;
    var x = Number(args.x) / QMovement.tileSize;
    var y = Number(args.y) / QMovement.tileSize;
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
    var chara = QPlus.getCharacter(args.charId);
    if (!chara) return;
    var type = args.type;
    chara.changeCollider(type, [
      args.shape,
      Number(args.width),
      Number(args.height),
      Number(args.ox),
      Number(args.oy),
    ]);
  });
}
