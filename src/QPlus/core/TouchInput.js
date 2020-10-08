import QPlus from "../QPlus";
import { _PARAMS } from "../constants";

if (_PARAMS["Ignore Mouse when inactive"]) {
  let isFocused = true;
  let focusWaiter;

  window.addEventListener("focus", function (e) {
    if (focusWaiter) {
      QPlus.removeWaitListener(focusWaiter);
    }
    focusWaiter = QPlus.wait(1).then(function () {
      TouchInput.stopPropagation();
      isFocused = true;
      focusWaiter = null;
    });
  });

  window.addEventListener("blur", function (e) {
    if (focusWaiter) {
      QPlus.removeWaitListener(focusWaiter);
      focusWaiter = null;
    }
    isFocused = false;
  });

  const Alias_TouchInput_update = TouchInput.update;
  TouchInput.update = function () {
    if (!isFocused) {
      this.clear();
      return;
    }
    Alias_TouchInput_update.call(this);
  };
}
