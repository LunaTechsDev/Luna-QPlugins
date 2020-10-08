var Alias_Game_Player_canMove = Game_Player.prototype.canMove;
Game_Player.prototype.canMove = function () {
  return (
    Alias_Game_Player_canMove.call(this) &&
    Game_Character.prototype.canMove.call(this)
  );
};

Game_Player.prototype.canClick = function () {
  return !TouchInput.insideWindow;
};

Game_Player.prototype.charaId = function () {
  return 0;
};

Game_Player.prototype.actor = function () {
  return $gameParty.leader();
};

Game_Player.prototype.notes = function () {
  return this.actor() ? this.actor().actor().note : "";
};
