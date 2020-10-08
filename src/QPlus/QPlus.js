export default {
  _waitListeners: [],

  _regex: {
    isBoolean: /^(true|false)$/i,
    isString: /^"(.*?)"$/,
    isNumber: /^-?\d+$/,
    isFloat: /^-?\d+\.?\d*$/,
    isPoint: /^\((-?\d+\.?\d*),\s*(-?\d+\.?\d*)\)$/,
    isArray: /^\[(.*?)\]$/,
    isObj: /^\{(.*?)\}$/,
  },

  getParams(id, convert) {
    var plugin = $plugins.filter(function (p) {
      return p.description.contains(id) && p.status;
    });
    var hasDefaults = typeof convert === "object";
    if (!plugin[0]) {
      return hasDefaults ? convert : {};
    }
    var params = Object.assign(
      hasDefaults ? convert : {},
      plugin[0].parameters
    );
    if (convert) {
      for (var param in params) {
        params[param] = this.stringToType(String(params[param]));
        if (hasDefaults && convert[param] !== undefined) {
          if (convert[param].constructor !== params[param].constructor) {
            var err =
              "Plugin Parameter value error. " + id + ", Parameter: " + param;
            err += "\nDefault value will be used.";
            console.warn(err);
            params[param] = convert[param];
          }
        }
      }
    }
    return params;
  },

  versionCheck(version, targetVersion) {
    version = version.split(".").map(Number);
    targetVersion = targetVersion.split(".").map(Number);
    if (version[0] < targetVersion[0]) {
      return false;
    } else if (
      version[0] === targetVersion[0] &&
      version[1] < targetVersion[1]
    ) {
      return false;
    } else if (
      version[1] === targetVersion[1] &&
      version[2] < targetVersion[2]
    ) {
      return false;
    }
    return true;
  },

  /**
   * @static makeArgs
   *  Splits a string every space. If words are wrapped in ""s or ''s they
   *  are kept grouped.
   * @param  {String} string
   * @return {Array}
   */
  makeArgs(string) {
    if (string.constructor === Array) {
      string = string.join(" ");
    }
    var args = [];
    var regex = /("?|'?)(.+?)\1(?:\s|$)/g;
    while (true) {
      var match = regex.exec(string);
      if (match) {
        args.push(match[2]);
      } else {
        break;
      }
    }
    return this.formatArgs(args);
  },

  formatArgs(args) {
    for (var i = 0; i < args.length; i++) {
      var arg = args[i].trim();
      var match = /\{(.*?)\}/.exec(arg);
      if (match) {
        var val = match[1];
        var cmd = match[1][0].toLowerCase();
        switch (cmd) {
          case "v": {
            var id = Number(match[1].slice(1));
            val = $gameVariables.value(id);
            break;
          }
          case "s": {
            var id = Number(match[1].slice(1));
            val = $gameSwitches.value(id);
            break;
          }
        }
        args[i] = args[i].replace(/\{(.*?)\}/, val);
      }
    }
    return args;
  },

  getArg(args, regex) {
    var arg = null;
    for (var i = 0; i < args.length; i++) {
      var match = regex.exec(args[i]);
      if (match) {
        if (match.length === 1) {
          arg = true;
        } else {
          arg = match[match.length - 1];
        }
        break;
      }
    }
    return arg;
  },

  getMeta(string) {
    var meta = {};
    var inlineRegex = /<([^<>:\/]+)(?::?)([^>]*)>/g;
    var blockRegex = /<([^<>:\/]+)>([\s\S]*?)<\/\1>/g;
    for (;;) {
      var match = inlineRegex.exec(string);
      if (match) {
        if (match[2] === "") {
          meta[match[1]] = true;
        } else {
          meta[match[1]] = match[2];
        }
      } else {
        break;
      }
    }
    for (;;) {
      var match = blockRegex.exec(string);
      if (match) {
        meta[match[1]] = match[2];
      } else {
        break;
      }
    }
    return meta;
  },

  getCharacter(string) {
    string = String(string).toLowerCase();
    if (/^[0-9]+$/.test(string)) {
      var id = Number(string);
      return id === 0 ? $gamePlayer : $gameMap.event(id);
    } else if (/^(player|p)$/.test(string)) {
      return $gamePlayer;
    } else {
      var isEvent = /^(event|e)([0-9]+)$/.exec(string);
      if (isEvent) {
        var eventId = Number(isEvent[2]);
        return eventId > 0 ? $gameMap.event(eventId) : null;
      }
      return null;
    }
  },

  charaIdToId(string) {
    string = String(string).toLowerCase();
    if (/^[0-9]+$/.test(string)) {
      return Number(string);
    } else if (/^(player|p)$/.test(string)) {
      return 0;
    } else {
      var isEvent = /^(event|e)([0-9]+)$/.exec(string);
      if (isEvent) {
        return Number(isEvent[2]);
      }
      return null;
    }
  },

  compareCharaId(a, b) {
    if (a === b) return true;
    return this.charaIdToId(a) === this.charaIdToId(b);
  },

  /**
   * @static request
   *  Creates an XHR request
   * @param  {String}   filePath
   *         path to the file to load
   * @param  {Function} callback
   *         callback on load, response value is passed as 1st argument
   * @param  {Function} err
   *         callback on error
   * @return {XMLHttpRequest}
   */
  request(filePath, callback, err) {
    var xhr = new XMLHttpRequest();
    xhr.url = filePath;
    xhr.open("GET", filePath, true);
    var type = filePath.split(".").pop().toLowerCase();
    if (type === "txt") {
      xhr.overrideMimeType("text/plain");
    } else if (type === "json") {
      xhr.overrideMimeType("application/json");
    }
    xhr.onload = function () {
      if (this.status < 400) {
        var val = this.responseText;
        if (type === "json") val = JSON.parse(val);
        this._onSuccess(val);
      }
    };
    xhr.onError = function (func) {
      this.onerror = func;
      return this;
    };
    xhr.onSuccess = function (func) {
      this._onSuccess = func;
      return this;
    };
    xhr._onSuccess = callback || function () {};
    xhr.onerror =
      err ||
      function () {
        console.error("Error:" + this.url + " not found");
      };
    xhr.send();
    return xhr;
  },

  /**
   * @static wait
   *  Calls callback once duration reachs 0
   * @param  {Number}   duration
   *         duration in frames to wait
   * @param  {Function} callback
   *         callback to call after wait is complete
   * @return {Waiter}
   *         Wait object that was created. Used to remove from listeners.
   *         Can also be used to use the .then function to add a callback
   *         instead of passing the callback in the parameter
   */
  wait(duration, callback) {
    var waiter = {
      duration: duration || 0,
      callback: callback,
      then: function (callback) {
        this.callback = callback;
        return this;
      },
    };
    this._waitListeners.push(waiter);
    return waiter;
  },

  removeWaitListener(waiter) {
    var i = this._waitListeners.indexOf(waiter);
    if (i === -1) return;
    this._waitListeners.splice(i, 1);
  },

  clearWaitListeners() {
    this._waitListeners = [];
  },

  mixin(to, what) {
    Object.getOwnPropertyNames(what).forEach(function (prop) {
      if (prop !== "constructor") {
        Object.defineProperty(
          to,
          prop,
          Object.getOwnPropertyDescriptor(what, prop)
        );
      }
    });
  },

  mixinWait(into) {
    this.mixin(into, {
      wait: this.wait,
      removeWaitListener: this.removeWaitListener,
      clearWaitListeners: this.clearWaitListeners,
      updateWaiters: this.updateWaiters,
    });
    if (into.update) {
      into.update_BEFOREWAIT = into.update;
      into.update = function () {
        this.update_BEFOREWAIT.apply(this, arguments);
        this.updateWaiters();
      };
    }
  },

  /**
   * @static stringToObj
   *   Converts a string into an object
   * @param  {String} string
   *         string in the format:
   *         key: value
   *         key2: value2
   * @return {Object}
   */
  stringToObj(string) {
    var lines = string.split("\n");
    var obj = {};
    lines.forEach(function (value) {
      var match = /^(.*):(.*)/.exec(value);
      if (match) {
        var key,
          newKey = match[1].trim();
        if (obj.hasOwnProperty(key)) {
          var i = 1;
          while (obj.hasOwnProperty(newKey)) {
            newKey = key + String(i);
            i++;
          }
        }
        var arr = this.stringToAry(match[2].trim());
        if (arr.length === 1) arr = arr[0];
        obj[newKey] = arr || "";
      }
    });
    return obj;
  },

  /**
   * @static stringToAry
   *  Converts a string into an array. And auto converts to
   *  Number, Point, true, false or null
   * @param  {String} string
   *         Separate values with a comma
   * @return {Array}
   */
  stringToAry(string) {
    // couldn't get this to work with split so went with regex
    var regex = /\s*(\(.*?\))|([^,]+)/g;
    var arr = [];
    while (true) {
      var match = regex.exec(string);
      if (match) {
        arr.push(match[0]);
      } else {
        break;
      }
    }
    return arr.map(this.stringToType.bind(this));
  },

  stringToType(string) {
    string = string.trim();
    var rx = this._regex;
    if (rx.isString.test(string)) {
      string = string.slice(1, -1);
    }
    if (rx.isBoolean.test(string)) {
      return string.toLowerCase() === "true";
    }
    if (rx.isFloat.test(string)) {
      return Number(string);
    }
    var isPoint = rx.isPoint.exec(string);
    if (isPoint) {
      return new Point(Number(isPoint[1]), Number(isPoint[2]));
    }
    if (rx.isArray.test(string)) {
      try {
        return JSON.parse(string).map(this.stringToType);
      } catch (e) {
        return string;
      }
    }
    if (rx.isObj.test(string)) {
      try {
        var obj = JSON.parse(string);
        for (var key in obj) {
          obj[key] = this.stringToType(obj[key]);
        }
        return obj;
      } catch (e) {
        return string;
      }
    }
    return string;
  },

  /**
   * @static pointToIndex
   *  Converts a point to an index
   * @param  {Point} point
   * @param  {Int}   maxCols
   * @param  {Int}   maxRows
   * @return {Int} index value
   */
  pointToIndex(point, maxCols, maxRows) {
    if (point.x >= maxCols) return -1;
    if (maxRows && point.y >= maxRows) return -1;
    return point.x + point.y * maxCols;
  },

  /**
   * @static indexToPoint
   * Converts an index to a Point
   * @param  {Int} index
   * @param  {Int} maxCols
   * @param  {Int} maxRows
   * @return {Point}
   */
  indexToPoint(index, maxCols, maxRows) {
    if (index < 0) return new Point(-1, -1);
    var x = index % maxCols;
    var y = Math.floor(index / maxCols);
    return new Point(x, y);
  },

  /**
   * @static adjustRadian
   * Keeps the radian between 0 and MAth.PI * 2
   * @param  {Int} radian
   * @return {Int}
   */
  adjustRadian(radian) {
    while (radian < 0) {
      radian += Math.PI * 2;
    }
    while (radian > Math.PI * 2) {
      radian -= Math.PI * 2;
    }
    return radian;
  },

  update() {
    this.updateWaiters();
  },

  updateWaiters() {
    var waiters = this._waitListeners;
    for (var i = waiters.length - 1; i >= 0; i--) {
      if (!waiters[i]) {
        waiters.splice(i, 1);
        continue;
      }
      if (waiters[i].duration <= 0) {
        if (typeof waiters[i].callback === "function") {
          try {
            waiters[i].callback();
          } catch (e) {
            console.error(e);
          }
        }
        waiters.splice(i, 1);
      } else {
        waiters[i].duration--;
      }
    }
  },
};
