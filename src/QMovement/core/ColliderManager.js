export default class ColliderManager {
  constructor() {
    this._colliders = [];
    this._colliderGrid = [];
    this._characterGrid = [];
    this._sectorSize = QMovement.tileSize;
    this._needsRefresh = true;
    this.container = new Sprite();
    this.container.alpha = 0.3;
    this.containerDict = {};
    this.visible = QMovement.showColliders;
  }

  clear() {
    this._colliders = [];
    this._colliderGrid = [];
    this._characterGrid = [];
    this.container.removeChildren();
    this.containerDict = {};
  }

  refresh() {
    this.clear();
    this._colliderGrid = new Array(this._mapWidth);
    for (let x = 0; x < this._colliderGrid.length; x++) {
      this._colliderGrid[x] = [];
      for (let y = 0; y < this._mapHeight; y++) {
        this._colliderGrid[x].push([]);
      }
    }
    this._characterGrid = new Array(this._mapWidth);
    for (let x = 0; x < this._characterGrid.length; x++) {
      this._characterGrid[x] = [];
      for (let y = 0; y < this._mapHeight; y++) {
        this._characterGrid[x].push([]);
      }
    }
    this._needsRefresh = false;
  }

  addCollider(collider, duration, ignoreGrid) {
    if (!$dataMap) return;
    const i = this._colliders.indexOf(collider);
    if (i === -1) {
      this._colliders.push(collider);
      if (duration > 0 || duration === -1) {
        this.draw(collider, duration);
      }
    }
    if (!ignoreGrid) {
      this.updateGrid(collider);
    }
  }

  addCharacter(character, duration) {
    if (!$dataMap) return;
    const i = this._colliders.indexOf(character);
    if (i === -1) {
      this._colliders.push(character);
      if (duration > 0 || duration === -1) {
        this.draw(character.collider("bounds"), duration);
      }
    }
    this.updateGrid(character);
  }

  remove(collider) {
    const i = this._colliders.indexOf(collider);
    if (i < 0) return;
    this.removeFromGrid(collider);
    if (!collider._colliders) collider.kill = true;
    this._colliders.splice(i, 1);
  }

  removeSprite(sprite) {
    this.container.removeChild(sprite);
    delete this.containerDict[sprite._collider.id];
  }

  updateGrid(collider, prevGrid) {
    if (this._needsRefresh) return;
    let currGrid;
    let grid;
    if (collider._colliders) {
      grid = this._characterGrid;
      currGrid = collider.collider("bounds").sectorEdge();
    } else {
      grid = this._colliderGrid;
      currGrid = collider.sectorEdge();
    }
    // TODO make this into 1 single 2d loop
    let x, y;
    if (prevGrid) {
      if (
        currGrid.x1 == prevGrid.x1 &&
        currGrid.y1 === prevGrid.y1 &&
        currGrid.x2 == prevGrid.x2 &&
        currGrid.y2 === prevGrid.y2
      ) {
        return;
      }
      for (x = prevGrid.x1; x <= prevGrid.x2; x++) {
        for (y = prevGrid.y1; y <= prevGrid.y2; y++) {
          if (!grid[x] || !grid[x][y]) continue;
          const i = grid[x][y].indexOf(collider);
          if (i !== -1) {
            grid[x][y].splice(i, 1);
          }
        }
      }
    }
    for (x = currGrid.x1; x <= currGrid.x2; x++) {
      for (y = currGrid.y1; y <= currGrid.y2; y++) {
        if (!grid[x] || !grid[x][y]) continue;
        grid[x][y].push(collider);
      }
    }
  }

  removeFromGrid(collider) {
    let grid;
    let edge;
    if (collider._colliders) {
      // Is a character obj
      grid = this._characterGrid;
      edge = collider.collider("bounds").sectorEdge();
    } else {
      // is a collider
      grid = this._colliderGrid;
      edge = collider.sectorEdge();
    }
    for (let x = edge.x1; x <= edge.x2; x++) {
      for (let y = edge.y1; y <= edge.y2; y++) {
        if (!grid[x] || !grid[x][y]) continue;
        const i = grid[x][y].indexOf(collider);
        if (i !== -1) {
          grid[x][y].splice(i, 1);
        }
      }
    }
  }

  getCharactersNear(collider, only) {
    const grid = collider.sectorEdge();
    const near = [];
    const checked = {};
    let x, y, i;
    for (x = grid.x1; x <= grid.x2; x++) {
      for (y = grid.y1; y <= grid.y2; y++) {
        if (x < 0 || x >= this.sectorCols()) continue;
        if (y < 0 || y >= this.sectorRows()) continue;
        const charas = this._characterGrid[x][y];
        for (i = 0; i < charas.length; i++) {
          if (checked[charas[i].charaId()]) {
            continue;
          }
          checked[charas[i].charaId()] = true;
          if (only) {
            const value = only(charas[i]);
            if (value === "break") {
              near.push(charas[i]);
              // Why was this in original code? It does not exist in this method.
              // isBreaking = true;
              return near;
            } else if (value === false) {
              continue;
            }
          }
          near.push(charas[i]);
        }
      }
    }
    return near;
  }

  getCollidersNear(collider, only, debug) {
    const grid = collider.sectorEdge();
    const near = [];
    const checked = {};
    let isBreaking = false;
    let x, y, i;
    for (x = grid.x1; x <= grid.x2; x++) {
      for (y = grid.y1; y <= grid.y2; y++) {
        if (x < 0 || x >= this.sectorCols()) continue;
        if (y < 0 || y >= this.sectorRows()) continue;
        const colliders = this._colliderGrid[x][y];
        for (i = 0; i < colliders.length; i++) {
          if (checked[colliders[i].id]) {
            continue;
          }
          checked[colliders[i].id] = true;
          if (only) {
            const value = only(colliders[i]);
            if (value === "break") {
              near.push(colliders[i]);
              isBreaking = true;
              break;
            } else if (value === false) {
              continue;
            }
          }
          near.push(colliders[i]);
        }
        if (isBreaking) break;
      }
      if (isBreaking) break;
    }
    only = null;
    return near;
  }

  getAllNear(collider, only) {
    const grid = collider.sectorEdge();
    const near = [];
    const checked = {};
    let x, y, i;
    for (x = grid.x1; x <= grid.x2; x++) {
      for (y = grid.y1; y <= grid.y2; y++) {
        if (x < 0 || x >= this.sectorCols()) continue;
        if (y < 0 || y >= this.sectorRows()) continue;
        const charas = this._characterGrid[x][y];
        const colliders = this._colliderGrid[x][y];
        for (i = 0; i < charas.length + colliders.length; i++) {
          const type = i >= charas.length ? "collider" : "chara";
          let obj;
          if (type === "chara") {
            obj = charas[i];
            if (checked[obj.charaId()]) {
              continue;
            }
            checked[obj.charaId()] = true;
          } else {
            obj = colliders[i - charas.length];
            if (checked[obj.id]) {
              continue;
            }
            checked[obj.id] = true;
          }
          if (only) {
            const value = only(type, obj);
            if (value === "break") {
              near.push(obj);
              return near;
            } else if (value === false) {
              continue;
            }
          }
          near.push(obj);
        }
      }
    }
    return near;
  }

  sectorCols() {
    return Math.floor((this._mapWidth * QMovement.tileSize) / this._sectorSize);
  }

  sectorRows() {
    return Math.floor(
      (this._mapHeight * QMovement.tileSize) / this._sectorSize
    );
  }

  draw(collider, duration) {
    if ($gameTemp.isPlaytest()) {
      if (this.containerDict[collider.id]) {
        this.containerDict[collider.id]._collider = collider;
        this.containerDict[collider.id]._collider.kill = false;
        this.containerDict[collider.id]._duration = duration;
        this.containerDict[collider.id].checkChanges();
        return;
      }
      collider.kill = false;
      const sprite = new Sprite_Collider(collider, duration || -1);
      this.container.addChild(sprite);
      this.containerDict[collider.id] = sprite;
    }
  }

  update() {
    if (this.visible) {
      this.show();
    } else {
      this.hide();
    }
  }

  toggle() {
    this.visible = !this.visible;
  }

  show() {
    this.container.visible = true;
  }

  hide() {
    this.container.visible = false;
  }

  convertToCollider(arr) {
    let type = arr[0].toLowerCase();
    if (type === "preset") {
      const arr = QMovement.presets[arr[1]];
      if (!arr) {
        alert(
          "ERROR: Tried to use a collider preset that doesn't exist: ",
          type
        );
        return null;
      }
      type = arr[0].toLowerCase();
    }
    const w = arr[1] || 0;
    const h = arr[2] || 0;
    const ox = arr[3] || 0;
    const oy = arr[4] || 0;
    let collider;
    if (type === "circle" || type === "box") {
      if (type === "circle") {
        collider = new Circle_Collider(w, h, ox, oy);
      } else {
        collider = new Box_Collider(w, h, ox, oy);
      }
    } else if (type === "poly") {
      collider = new Polygon_Collider(arr.slice(1));
    } else {
      return null;
    }
    return collider;
  }

  rayCast(origin, angle, dist, filter) {
    // Incomplete
    // need to finish the Polygon_Collider.prototype.lineIntersection function
    const ray = new Box_Collider(dist, 1, 0, 0, {
      pivot: new Point(0, 0.5),
      position: origin,
    });
    //this.draw(ray, 600);
    return this.getAllNear(ray, filter);
  }
}
