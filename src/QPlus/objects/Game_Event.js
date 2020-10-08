var Alias_Game_Event_initMembers = Game_Event.prototype.initMembers;
Game_Event.prototype.initMembers = function () {
  Alias_Game_Event_initMembers.call(this);
  this._comments = null;
  this._prevDir = null;
};

Game_Event.prototype.charaId = function () {
  return this.eventId();
};

Game_Event.prototype.notes = function (withComments) {
  var notes = this.event() ? this.event().note : "";
  return notes + (withComments ? this.comments() : "");
};

Game_Event.prototype.comments = function (withNotes) {
  var notes = "";
  if (this.event()) {
    notes = this.event().note;
  }
  return this._comments + (withNotes ? notes : "");
};

Game_Event.prototype.setupComments = function () {
  this._comments = "";
  if (this.page() && this.list()) {
    this._comments = this.list()
      .filter(function (list) {
        return list.code === 108 || list.code === 408;
      })
      .map(function (list) {
        return list.parameters;
      })
      .join("\n");
  }
};

var Alias_Game_Event_setupPage = Game_Event.prototype.setupPage;
Game_Event.prototype.setupPage = function () {
  var firstTime = this._prevDir === null;
  this._prevDir = this.direction();
  Alias_Game_Event_setupPage.call(this);
  var retainDir = /<retainDir>/i.test(this.comments(true));
  if (!firstTime && retainDir) {
    this.setDirection(this._prevDir);
  }
};

var Alias_Game_Event_clearPageSettings = Game_Event.prototype.clearPageSettings;
Game_Event.prototype.clearPageSettings = function () {
  Alias_Game_Event_clearPageSettings.call(this);
  this._comments = "";
};

var Alias_Game_Event_setupPageSettings = Game_Event.prototype.setupPageSettings;
Game_Event.prototype.setupPageSettings = function () {
  Alias_Game_Event_setupPageSettings.call(this);
  this.setupComments();
};

Game_Event.prototype.setSelfSwitch = function (selfSwitch, bool) {
  var mapId = this._mapId;
  var eventId = this._eventId;
  if (!mapId || !eventId) return;
  var key = [mapId, eventId, selfSwitch];
  $gameSelfSwitches.setValue(key, bool);
};

var Alias_Game_Event_updateSelfMovement =
  Game_Event.prototype.updateSelfMovement;
Game_Event.prototype.updateSelfMovement = function () {
  if (!this.canMove()) return;
  Alias_Game_Event_updateSelfMovement.call(this);
};
