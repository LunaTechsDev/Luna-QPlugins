Input.stopPropagation = function () {
  const key = this._latestButton;
  this._currentState[key] = false;
  this._latestButton = null;
  for (let i = 0; i < this._gamepadStates.length; i++) {
    if (!this._gamepadStates[i]) continue;
    for (let j = 0; j < this._gamepadStates[i].length; j++) {
      const button =
        typeof QInput !== "undefined"
          ? this.gamepadKeys[j]
          : this.gamepadMapper[j];
      if (button === key) {
        this._gamepadStates[i][j] = false;
        break;
      }
    }
  }
  if (typeof QInput !== "undefined") {
    this._ranPress = false;
    this._lastPressed = null;
    this._lastTriggered = null;
    this._lastGamepadTriggered = null;
  }
};
