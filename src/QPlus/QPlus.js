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
    const plugin = $plugins.filter(function (p) {
      return p.description.contains(id) && p.status;
    });
    const hasDefaults = typeof convert === "object";
    if (!plugin[0]) {
      return hasDefaults ? convert : {};
    }
    const params = Object.assign(
      hasDefaults ? convert : {},
      plugin[0].parameters
    );
    if (convert) {
      for (const param in params) {
        params[param] = this.stringToType(String(params[param]));
        if (hasDefaults && convert[param] !== undefined) {
          if (convert[param].constructor !== params[param].constructor) {
            let err =
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
    const args = [];
    const regex = /("?|'?)(.+?)\1(?:\s|$)/g;
    while (true) {
      const match = regex.exec(string);
      if (match) {
        args.push(match[2]);
      } else {
        break;
      }
    }
    return this.formatArgs(args);
  },

  formatArgs(args) {
    for (let i = 0; i < args.length; i++) {
      const arg = args[i].trim();
      const match = /\{(.*?)\}/.exec(arg);
      if (match) {
        let val = match[1];
        const cmd = match[1][0].toLowerCase();
        switch (cmd) {
          case "v": {
            const id = Number(match[1].slice(1));
            val = $gameVariables.value(id);
            break;
          }
          case "s": {
            const id = Number(match[1].slice(1));
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
    let arg = null;
    for (let i = 0; i < args.length; i++) {
      const match = regex.exec(args[i]);
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
    const meta = {};
    const inlineRegex = /<([^<>:\/]+)(?::?)([^>]*)>/g;
    const blockRegex = /<([^<>:\/]+)>([\s\S]*?)<\/\1>/g;
    for (;;) {
      const match = inlineRegex.exec(string);
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
      const match = blockRegex.exec(string);
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
      const id = Number(string);
      return id === 0 ? $gamePlayer : $gameMap.event(id);
    } else if (/^(player|p)$/.test(string)) {
      return $gamePlayer;
    } else {
      const isEvent = /^(event|e)([0-9]+)$/.exec(string);
      if (isEvent) {
        const eventId = Number(isEvent[2]);
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
      const isEvent = /^(event|e)([0-9]+)$/.exec(string);
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
    const xhr = new XMLHttpRequest();
    xhr.url = filePath;
    xhr.open("GET", filePath, true);
    const type = filePath.split(".").pop().toLowerCase();
    if (type === "txt") {
      xhr.overrideMimeType("text/plain");
    } else if (type === "json") {
      xhr.overrideMimeType("application/json");
    }
    xhr.onload = function () {
      if (this.status < 400) {
        let val = this.responseText;
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
    const waiter = {
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
    const i = this._waitListeners.indexOf(waiter);
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
    const lines = string.split("\n");
    const obj = {};
    lines.forEach(function (value) {
      const match = /^(.*):(.*)/.exec(value);
      if (match) {
        let key,
          newKey = match[1].trim();
        if (obj.hasOwnProperty(key)) {
          let i = 1;
          while (obj.hasOwnProperty(newKey)) {
            newKey = key + String(i);
            i++;
          }
        }
        let arr = this.stringToAry(match[2].trim());
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
    const regex = /\s*(\(.*?\))|([^,]+)/g;
    const arr = [];
    while (true) {
      const match = regex.exec(string);
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
    const rx = this._regex;
    if (rx.isString.test(string)) {
      string = string.slice(1, -1);
    }
    if (rx.isBoolean.test(string)) {
      return string.toLowerCase() === "true";
    }
    if (rx.isFloat.test(string)) {
      return Number(string);
    }
    const isPoint = rx.isPoint.exec(string);
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
        const obj = JSON.parse(string);
        for (const key in obj) {
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
    const x = index % maxCols;
    const y = Math.floor(index / maxCols);
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
    const waiters = this._waitListeners;
    for (let i = waiters.length - 1; i >= 0; i--) {
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
