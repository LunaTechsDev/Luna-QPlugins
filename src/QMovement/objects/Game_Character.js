const Alias_Game_Character_processMoveCommand =
  Game_Character.prototype.processMoveCommand;
Game_Character.prototype.processMoveCommand = function (command) {
  this.subMVMoveCommands(command);
  if (this.subQMoveCommand(command)) {
    command = this._moveRoute.list[this._moveRouteIndex];
  }
  this.processQMoveCommands(command);
  Alias_Game_Character_processMoveCommand.call(this, command);
};

Game_Character.prototype.subMVMoveCommands = function (command) {
  const gc = Game_Character;
  const params = command.parameters;
  switch (command.code) {
    case gc.ROUTE_MOVE_DOWN: {
      this.subQMove("2, 1," + QMovement.tileSize);
      break;
    }
    case gc.ROUTE_MOVE_LEFT: {
      this.subQMove("4, 1," + QMovement.tileSize);
      break;
    }
    case gc.ROUTE_MOVE_RIGHT: {
      this.subQMove("6, 1," + QMovement.tileSize);
      break;
    }
    case gc.ROUTE_MOVE_UP: {
      this.subQMove("8, 1," + QMovement.tileSize);
      break;
    }
    case gc.ROUTE_MOVE_LOWER_L: {
      this.subQMove("1, 1," + QMovement.tileSize);
      break;
    }
    case gc.ROUTE_MOVE_LOWER_R: {
      this.subQMove("3, 1," + QMovement.tileSize);
      break;
    }
    case gc.ROUTE_MOVE_UPPER_L: {
      this.subQMove("7, 1," + QMovement.tileSize);
      break;
    }
    case gc.ROUTE_MOVE_UPPER_R: {
      this.subQMove("9, 1," + QMovement.tileSize);
      break;
    }
    case gc.ROUTE_MOVE_FORWARD: {
      this.subQMove("5, 1," + QMovement.tileSize);
      break;
    }
    case gc.ROUTE_MOVE_BACKWARD: {
      this.subQMove("0, 1," + QMovement.tileSize);
      break;
    }
    case gc.ROUTE_TURN_DOWN:
    case gc.ROUTE_TURN_LEFT:
    case gc.ROUTE_TURN_RIGHT:
    case gc.ROUTE_TURN_UP:
    case gc.ROUTE_TURN_90D_R:
    case gc.ROUTE_TURN_90D_L:
    case gc.ROUTE_TURN_180D:
    case gc.ROUTE_TURN_90D_R_L:
    case gc.ROUTE_TURN_RANDOM:
    case gc.ROUTE_TURN_TOWARD:
    case gc.ROUTE_TURN_AWAY: {
      this._freqCount = this.freqThreshold();
      break;
    }
  }
};

Game_Character.prototype.subQMoveCommand = function (command) {
  const gc = Game_Character;
  const code = command.code;
  const params = command.parameters;
  if (command.code === gc.ROUTE_SCRIPT) {
    const qmove = /^qmove\((.*)\)/i.exec(params[0]);
    const qmove2 = /^qmove2\((.*)\)/i.exec(params[0]);
    const arc = /^arc\((.*)\)/i.exec(params[0]);
    const arc2 = /^arc2\((.*)\)/i.exec(params[0]);
    if (qmove) return this.subQMove(qmove[1]);
    if (qmove2) return this.subQMove2(qmove2[1]);
    if (arc) return this.subArc(arc[1]);
    if (arc2) return this.subArc2(arc2[1]);
  }
  return false;
};

Game_Character.prototype.processQMoveCommands = function (command) {
  const params = command.parameters;
  switch (command.code) {
    case "arc": {
      this.arc(params[0], params[1], eval(params[2]), params[3], params[4]);
      break;
    }
    case "arc2": {
      const x = params[0] + this.px;
      const y = params[1] + this.py;
      this.arc(x, y, eval(params[2]), params[3], params[4]);
      break;
    }
    case "fixedRadianMove": {
      this.fixedRadianMove(params[0], params[1]);
      break;
    }
    case "fixedMove": {
      this.fixedMove(params[0], params[1]);
      break;
    }
    case "fixedMoveBackward": {
      this.fixedMoveBackward(params[0]);
      break;
    }
    case "fixedMoveForward": {
      this.fixedMove(this.direction(), params[0]);
      break;
    }
  }
};

Game_Character.prototype.subArc = function (settings) {
  const cmd = {};
  cmd.code = "arc";
  cmd.parameters = QPlus.stringToAry(settings);
  this._moveRoute.list[this._moveRouteIndex] = cmd;
  return true;
};

Game_Character.prototype.subArc2 = function (settings) {
  const cmd = {};
  cmd.code = "arc2";
  cmd.parameters = QPlus.stringToAry(settings);
  this._moveRoute.list[this._moveRouteIndex] = cmd;
  return true;
};

Game_Character.prototype.subQMove = function (settings) {
  settings = QPlus.stringToAry(settings);
  const dir = settings[0];
  const amt = settings[1];
  const multi = settings[2] || 1;
  const tot = amt * multi;
  const steps = Math.floor(tot / this.moveTiles());
  let moved = 0;
  let i;
  for (i = 0; i < steps; i++) {
    moved += this.moveTiles();
    const cmd = {};
    if (dir === 0) {
      cmd.code = "fixedMoveBackward";
      cmd.parameters = [this.moveTiles()];
    } else if (dir === 5) {
      cmd.code = "fixedMoveForward";
      cmd.parameters = [this.moveTiles()];
    } else {
      cmd.code = "fixedMove";
      cmd.parameters = [dir, this.moveTiles()];
    }
    this._moveRoute.list.splice(this._moveRouteIndex + 1, 0, cmd);
  }
  if (moved < tot) {
    const cmd = {};
    if (dir === 0) {
      cmd.code = "fixedMoveBackward";
      cmd.parameters = [this.moveTiles()];
    } else if (dir === 5) {
      cmd.code = "fixedMoveForward";
      cmd.parameters = [this.moveTiles()];
    } else {
      cmd.code = "fixedMove";
      cmd.parameters = [dir, this.moveTiles()];
    }
    this._moveRoute.list.splice(this._moveRouteIndex + 1 + i, 0, cmd);
  }
  this._moveRoute.list.splice(this._moveRouteIndex, 1);
  return true;
};

Game_Character.prototype.subQMove2 = function (settings) {
  settings = QPlus.stringToAry(settings);
  const radian = settings[0];
  const dist = settings[1];
  const maxSteps = Math.floor(dist / this.moveTiles());
  let steps = 0;
  let i;
  for (i = 0; i < maxSteps; i++) {
    steps += this.moveTiles();
    const cmd = {};
    cmd.code = "fixedRadianMove";
    cmd.parameters = [radian, this.moveTiles()];
    this._moveRoute.list.splice(this._moveRouteIndex + 1, 0, cmd);
  }
  if (steps < dist) {
    const cmd = {};
    cmd.code = "fixedRadianMove";
    cmd.parameters = [radian, dist - steps];
    this._moveRoute.list.splice(this._moveRouteIndex + 1 + i, 0, cmd);
  }
  this._moveRoute.list.splice(this._moveRouteIndex, 1);
  return true;
};

Game_Character.prototype.moveRandom = function () {
  const d = 2 + Math.randomInt(4) * 2;
  if (this.canPixelPass(this._px, this._py, d)) {
    this.moveStraight(d);
  }
};

const Alias_Game_Character_moveTowardCharacter =
  Game_Character.prototype.moveTowardCharacter;
Game_Character.prototype.moveTowardCharacter = function (character) {
  if ($gameMap.offGrid()) {
    const dx = this.deltaPXFrom(character.cx());
    const dy = this.deltaPYFrom(character.cy());
    let radian = Math.atan2(-dy, -dx);
    if (radian < 0) radian += Math.PI * 2;
    const oldSM = this._smartMove;
    if (oldSM <= 1) this._smartMove = 2;
    this.moveRadian(radian);
    this._smartMove = oldSM;
  } else {
    Alias_Game_Character_moveTowardCharacter.call(this, character);
  }
};

const Alias_Game_Character_moveAwayFromCharacter =
  Game_Character.prototype.moveAwayFromCharacter;
Game_Character.prototype.moveAwayFromCharacter = function (character) {
  if ($gameMap.offGrid()) {
    const dx = this.deltaPXFrom(character.cx());
    const dy = this.deltaPYFrom(character.cy());
    let radian = Math.atan2(dy, dx);
    if (radian < 0) radian += Math.PI * 2;
    const oldSM = this._smartMove;
    if (oldSM <= 1) this._smartMove = 2;
    this.moveRadian(radian);
    this._smartMove = oldSM;
  } else {
    Alias_Game_Character_moveAwayFromCharacter.call(this, character);
  }
};

Game_Character.prototype.turnTowardCharacter = function (character) {
  const dx = this.deltaPXFrom(character.cx());
  const dy = this.deltaPYFrom(character.cy());
  this.setRadian(Math.atan2(-dy, -dx));
};

Game_Character.prototype.turnTowardCharacterForward = function (character, dt) {
  if (!character.isMoving()) {
    return this.turnTowardCharacter(character);
  }
  dt = dt || 1;
  const forward = character.forwardV();
  const x = character.cx() + forward.x * dt;
  const y = character.cy() + forward.y * dt;
  const dx = this.deltaPXFrom(x);
  const dy = this.deltaPYFrom(y);
  this.setRadian(Math.atan2(-dy, -dx));
};

Game_Character.prototype.turnAwayFromCharacter = function (character) {
  const dx = this.deltaPXFrom(character.cx());
  const dy = this.deltaPYFrom(character.cy());
  this.setRadian(Math.atan2(dy, dx));
};

Game_Character.prototype.deltaPXFrom = function (x) {
  return $gameMap.deltaPX(this.cx(), x);
};

Game_Character.prototype.deltaPYFrom = function (y) {
  return $gameMap.deltaPY(this.cy(), y);
};

Game_Character.prototype.pixelDistanceFrom = function (x, y) {
  return $gameMap.distance(this.cx(), this.cy(), x, y);
};

// Returns the px, py needed for this character to be center aligned
// with the character passed in (align is based off collision collider)
Game_Character.prototype.centerWith = function (character) {
  const dx1 = this.cx() - this._px;
  const dy1 = this.cy() - this._py;
  const dx2 = character.cx() - character._px;
  const dy2 = character.cy() - character._py;
  const dx = dx2 - dx1;
  const dy = dy2 - dy1;
  return new Point(character._px + dx, character._py + dy);
};

Game_Character.prototype.centerWithCollider = function (collider) {
  const dx1 = this.cx() - this._px;
  const dy1 = this.cy() - this._py;
  const dx2 = collider.center.x - collider.x;
  const dy2 = collider.center.y - collider.y;
  const dx = dx2 - dx1;
  const dy = dy2 - dy1;
  return new Point(collider.x + dx, collider.y + dy);
};

Game_Character.prototype.adjustPosition = function (xf, yf) {
  let dx = xf - this._px;
  let dy = yf - this._py;
  const radian = Math.atan2(dy, dx);
  const distX = Math.cos(radian) * this.moveTiles();
  const distY = Math.sin(radian) * this.moveTiles();
  const final = new Point(xf, yf);
  while (!this.canPixelPass(final.x, final.y, 5, "collision")) {
    final.x -= distX;
    final.y -= distY;
    dx = final.x - this._px;
    dy = final.y - this._py;
    if (Math.atan2(dy, dx) !== radian) {
      final.x = this._px;
      final.y = this._py;
      break;
    }
  }
  this.moveColliders(this._px, this._py);
  return final;
};
