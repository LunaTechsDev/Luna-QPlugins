//-----------------------------------------------------------------------------
// Game_Event

var Alias_Game_Event_setupPage = Game_Event.prototype.setupPage;
Game_Event.prototype.setupPage = function () {
  if (this._isChasing !== false) {
    this.clearPathfind();
  }
  Alias_Game_Event_setupPage.call(this);
};
