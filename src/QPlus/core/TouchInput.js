if (_PARAMS["Ignore Mouse when inactive"]) {
  var isFocused = true;
  var focusWaiter;

  window.addEventListener("focus", function (e) {
    if (focusWaiter) {
      _QPlus.removeWaitListener(focusWaiter);
    }
    focusWaiter = _QPlus.wait(1).then(function () {
      TouchInput.stopPropagation();
      isFocused = true;
      focusWaiter = null;
    });
  });

  window.addEventListener("blur", function (e) {
    if (focusWaiter) {
      _QPlus.removeWaitListener(focusWaiter);
      focusWaiter = null;
    }
    isFocused = false;
  });

  var Alias_TouchInput_update = TouchInput.update;
  TouchInput.update = function () {
    if (!isFocused) {
      this.clear();
      return;
    }
    Alias_TouchInput_update.call(this);
  };
}
