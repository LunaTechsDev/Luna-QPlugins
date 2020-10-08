var Alias_Game_Temp_isDestinationValid = Game_Temp.prototype.isDestinationValid;
Game_Temp.prototype.isDestinationValid = function () {
  var valid = Alias_Game_Temp_isDestinationValid.call(this);
  return !TouchInput.insideWindow && valid;
};
