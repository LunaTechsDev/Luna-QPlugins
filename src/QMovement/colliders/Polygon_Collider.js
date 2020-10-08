export default function Polygon_Collider() {
  this.initialize.apply(this, arguments);
}

Polygon_Collider._counter = 0;

Polygon_Collider.prototype.initialize = function (points) {
  const args = [];
  for (let i = 1; i < arguments.length; i++) {
    args.push(arguments[i]);
  }
  this.initMembers.apply(this, args);
  this.makeVertices(points);
};

Polygon_Collider.prototype.initMembers = function (x, y) {
  x = x !== undefined ? x : 0;
  y = y !== undefined ? y : 0;
  this._position = new Point(x, y);
  this._scale = new Point(1, 1);
  this._offset = new Point(0, 0);
  this._pivot = new Point(0, 0);
  this._radian = 0;
  this._note = "";
  this.meta = {};
  this.id = Polygon_Collider._counter++;
};

Object.defineProperty(Polygon_Collider.prototype, "note", {
  get() {
    return this._note;
  },
  set(note) {
    this._note = note;
    this.meta = QPlus.getMeta(note);
  },
});

Object.defineProperty(Polygon_Collider.prototype, "x", {
  get() {
    return this._position.x;
  },
  set(x) {
    this._position.x = x;
  },
});

Object.defineProperty(Polygon_Collider.prototype, "y", {
  get() {
    return this._position.y;
  },
  set(y) {
    this._position.y = y;
  },
});

Object.defineProperty(Polygon_Collider.prototype, "ox", {
  get() {
    return this._offset.x + this._pivot.x;
  },
  set(value) {
    this._offset.x = value;
    this.refreshVertices();
  },
});

Object.defineProperty(Polygon_Collider.prototype, "oy", {
  get() {
    return this._offset.y + this._pivot.y;
  },
  set(value) {
    this._offset.y = value - this._pivot.y;
    this.refreshVertices();
  },
});

Polygon_Collider.prototype.isPolygon = function () {
  return true;
};

Polygon_Collider.prototype.isBox = function () {
  return true;
};

Polygon_Collider.prototype.isCircle = function () {
  return false;
};

Polygon_Collider.prototype.makeVertices = function (points) {
  this._vertices = [];
  this._baseVertices = [];
  this._edges = [];
  this._vectors = [];
  this._xMin = null;
  this._xMax = null;
  this._yMin = null;
  this._yMax = null;
  for (let i = 0; i < points.length; i++) {
    const x = points[i].x - this._pivot.x;
    const y = points[i].y - this._pivot.y;
    const x2 = x + this.x + this.ox;
    const y2 = y + this.y + this.oy;
    this._vertices.push(new Point(x2, y2));
    this._baseVertices.push(new Point(x, y));
    if (i !== 0) {
      const prev = this._vertices[i - 1];
      this._edges.push({
        x1: prev.x,
        x2: x2,
        y1: prev.y,
        y2: y2,
      });
    }
    if (i === points.length - 1) {
      const first = this._vertices[0];
      this._edges.push({
        x1: x2,
        x2: first.x,
        y1: y2,
        y2: first.y,
      });
    }
    let radian = Math.atan2(y, x);
    radian += radian < 0 ? Math.PI * 2 : 0;
    const dist = Math.sqrt(x * x + y * y);
    this._vectors.push({ radian, dist });
    if (this._xMin === null || this._xMin > x) {
      this._xMin = x;
    }
    if (this._xMax === null || this._xMax < x) {
      this._xMax = x;
    }
    if (this._yMin === null || this._yMin > y) {
      this._yMin = y;
    }
    if (this._yMax === null || this._yMax < y) {
      this._yMax = y;
    }
  }
  this.width = Math.abs(this._xMax - this._xMin);
  this.height = Math.abs(this._yMax - this._yMin);
  const x1 = this._xMin + this.x + this.ox;
  const y1 = this._yMin + this.y + this.oy;
  this.center = new Point(x1 + this.width / 2, y1 + this.height / 2);
};

Polygon_Collider.prototype.makeVectors = function () {
  this._vectors = this._baseVertices.map(
    function (vertex) {
      const dx = vertex.x - this._pivot.x;
      const dy = vertex.y - this._pivot.y;
      let radian = Math.atan2(dy, dx);
      radian += radian < 0 ? Math.PI * 2 : 0;
      const dist = Math.sqrt(dx * dx + dy * dy);
      return { radian, dist };
    }.bind(this)
  );
};

Polygon_Collider.prototype.setBounds = function () {
  this._xMin = null;
  this._xMax = null;
  this._yMin = null;
  this._yMax = null;
  for (let i = 0; i < this._baseVertices.length; i++) {
    const x = this._baseVertices[i].x;
    const y = this._baseVertices[i].y;
    if (this._xMin === null || this._xMin > x) {
      this._xMin = x;
    }
    if (this._xMax === null || this._xMax < x) {
      this._xMax = x;
    }
    if (this._yMin === null || this._yMin > y) {
      this._yMin = y;
    }
    if (this._yMax === null || this._yMax < y) {
      this._yMax = y;
    }
  }
  this.width = Math.abs(this._xMax - this._xMin);
  this.height = Math.abs(this._yMax - this._yMin);
  const x1 = this._xMin + this.x + this.ox;
  const y1 = this._yMin + this.y + this.oy;
  this.center = new Point(x1 + this.width / 2, y1 + this.height / 2);
};

Polygon_Collider.prototype.refreshVertices = function () {
  this._edges = [];
  let i, j;
  for (i = 0, j = this._vertices.length; i < j; i++) {
    const vertex = this._vertices[i];
    vertex.x = this.x + this._baseVertices[i].x + this.ox;
    vertex.y = this.y + this._baseVertices[i].y + this.oy;
    if (i !== 0) {
      const prev = this._vertices[i - 1];
      this._edges.push({
        x1: prev.x,
        x2: vertex.x,
        y1: prev.y,
        y2: vertex.y,
      });
    }
    if (i === j - 1) {
      const first = this._vertices[0];
      this._edges.push({
        x1: vertex.x,
        x2: first.x,
        y1: vertex.y,
        y2: first.y,
      });
    }
  }
  this.setBounds();
};

Polygon_Collider.prototype.sectorEdge = function () {
  let x1 = this._xMin + this.x + this.ox;
  let x2 = this._xMax + this.x + this.ox - 1;
  let y1 = this._yMin + this.y + this.oy;
  let y2 = this._yMax + this.y + this.oy - 1;
  x1 = Math.floor(x1 / ColliderManager._sectorSize);
  x2 = Math.floor(x2 / ColliderManager._sectorSize);
  y1 = Math.floor(y1 / ColliderManager._sectorSize);
  y2 = Math.floor(y2 / ColliderManager._sectorSize);
  return {
    x1: x1,
    x2: x2,
    y1: y1,
    y2: y2,
  };
};

Polygon_Collider.prototype.gridEdge = function () {
  let x1 = this._xMin + this.x + this.ox;
  let x2 = this._xMax + this.x + this.ox - 1;
  let y1 = this._yMin + this.y + this.oy;
  let y2 = this._yMax + this.y + this.oy - 1;
  x1 = Math.floor(x1 / QMovement.tileSize);
  x2 = Math.floor(x2 / QMovement.tileSize);
  y1 = Math.floor(y1 / QMovement.tileSize);
  y2 = Math.floor(y2 / QMovement.tileSize);
  return {
    x1: x1,
    x2: x2,
    y1: y1,
    y2: y2,
  };
};

Polygon_Collider.prototype.edge = function () {
  const x1 = this._xMin + this.x + this.ox;
  const x2 = this._xMax + this.x + this.ox - 1;
  const y1 = this._yMin + this.y + this.oy;
  const y2 = this._yMax + this.y + this.oy - 1;
  return {
    x1: x1,
    x2: x2,
    y1: y1,
    y2: y2,
  };
};

Polygon_Collider.prototype.setPivot = function (x, y) {
  this._pivot.x = x;
  this._pivot.y = y;
  this.makeVectors();
  this.rotate(0); // Resets base vertices
};

Polygon_Collider.prototype.centerPivot = function () {
  this._pivot.x = this.width / 2;
  this._pivot.y = this.height / 2;
  this.makeVectors();
  this.rotate(0); // Resets base vertices
};

Polygon_Collider.prototype.setRadian = function (radian) {
  radian = radian !== undefined ? radian : 0;
  this.rotate(radian - this._radian);
};

Polygon_Collider.prototype.rotate = function (radian) {
  this._radian += radian;
  for (let i = 0; i < this._vectors.length; i++) {
    const vector = this._vectors[i];
    vector.radian += radian;
    const x = vector.dist * Math.cos(vector.radian);
    const y = vector.dist * Math.sin(vector.radian);
    this._baseVertices[i].x = Math.round(x);
    this._baseVertices[i].y = Math.round(y);
  }
  this.refreshVertices();
};

Polygon_Collider.prototype.setScale = function (zX, zY) {
  zX = zX !== undefined ? zX : 1;
  zY = zY !== undefined ? zY : 1;
  this.scale(zX / this._scale.x, zY / this._scale.y);
};

Polygon_Collider.prototype.scale = function (zX, zY) {
  this._scale.x *= zX;
  this._scale.y *= zY;
  for (let i = 0; i < this._vectors.length; i++) {
    const vector = this._vectors[i];
    let x = vector.dist * Math.cos(vector.radian);
    let y = vector.dist * Math.sin(vector.radian);
    x *= zX;
    y *= zY;
    vector.radian = Math.atan2(y, x);
    vector.radian += vector.radian < 0 ? Math.PI * 2 : 0;
    vector.dist = Math.sqrt(x * x + y * y);
    this._baseVertices[i].x = Math.round(x);
    this._baseVertices[i].y = Math.round(y);
  }
  this.refreshVertices();
};

Polygon_Collider.prototype.moveTo = function (x, y) {
  if (x !== this.x || y !== this.y) {
    this.x = x;
    this.y = y;
    this.refreshVertices();
  }
};

Polygon_Collider.prototype.intersects = function (other) {
  if (this.height === 0 || this.width === 0) return false;
  if (other.height === 0 || other.width === 0) return false;
  if (!other.isPolygon()) {
    if (this.containsPoint(other.center.x, other.center.y)) return true;
  }
  if (!this.isPolygon()) {
    if (other.containsPoint(this.center.x, this.center.y)) return true;
  }
  let i, j, x, y;
  for (i = 0, j = other._vertices.length; i < j; i++) {
    x = other._vertices[i].x;
    y = other._vertices[i].y;
    if (this.containsPoint(x, y)) return true;
  }
  for (i = 0, j = this._vertices.length; i < j; i++) {
    x = this._vertices[i].x;
    y = this._vertices[i].y;
    if (other.containsPoint(x, y)) return true;
  }
  // TODO add edge checking
  /*
    for (i = 0; i < this._edges.length; i++) {
      for (j = 0; j < other._edges.length; j++) {

      }
    }*/
  return false;
};

Polygon_Collider.prototype.inside = function (other) {
  if (this.height === 0 || this.width === 0) return false;
  if (other.height === 0 || other.width === 0) return false;
  let i, j, x, y;
  for (i = 0, j = other._vertices.length; i < j; i++) {
    x = other._vertices[i].x;
    y = other._vertices[i].y;
    if (!this.containsPoint(x, y)) {
      return false;
    }
  }
  return true;
};

Polygon_Collider.prototype.containsPoint = function (x, y) {
  let i;
  let j = this._vertices.length - 1;
  let odd = false;
  const poly = this._vertices;
  for (i = 0; i < this._vertices.length; i++) {
    if (
      (poly[i].y < y && poly[j].y >= y) ||
      (poly[j].y < y && poly[i].y >= y)
    ) {
      if (
        poly[i].x +
          ((y - poly[i].y) / (poly[j].y - poly[i].y)) *
            (poly[j].x - poly[i].x) <
        x
      ) {
        odd = !odd;
      }
    }
    j = i;
  }
  return odd;
};

Polygon_Collider.prototype.lineIntersection = function (lineA, lineB) {
  const a1 = lineA.y1 - lineA.y2;
  const b1 = lineA.x2 - lineA.x1;
  const a2 = lineB.y1 - lineB.y2;
  const b2 = lineB.x2 - lineB.x1;
  const det = a1 * b2 - a2 * b1;
  if (det == 0) {
    return false;
  }
  const c1 = a1 * lineA.x1 + b1 * lineA.y1;
  const c2 = a2 * lineB.x1 + b2 * lineB.y1;
  const x = (b2 * c1 - b1 * c2) / det;
  const y = (a1 * c2 - a2 * c1) / det;
  // incomplete
  // returns false if lines don't intersect
  // x/y will return where or when they will intersect
  return new Point(x, y);
};

// TODO Optimize this
// Compaire other methods, example atan2 - atan2 or a dot product
Polygon_Collider.prototype.bestPairFrom = function (point) {
  const vertices = this._vertices;
  const radians = [];
  const points = [];
  for (let i = 0; i < vertices.length; i++) {
    let radian = Math.atan2(vertices[i].y - point.y, vertices[i].x - point.x);
    radian += radian < 0 ? 2 * Math.PI : 0;
    radians.push(radian);
    points.push(new Point(vertices[i].x, vertices[i].y));
  }
  let bestPair = [];
  let currI = 0;
  let max = -Math.PI * 2;
  while (points.length > 0) {
    const curr = points.shift();
    for (let i = 0; i < points.length; i++) {
      const dr = radians[currI] - radians[currI + i + 1];
      if (Math.abs(dr) > max) {
        max = Math.abs(dr);
        bestPair = [currI, currI + i + 1];
      }
    }
    currI++;
  }
  return bestPair;
};

// returns a new polygon
Polygon_Collider.prototype.stretchedPoly = function (radian, dist) {
  const dist2 = dist + Math.max(this.width, this.height);
  const xComponent = Math.cos(radian) * dist;
  const yComponent = Math.sin(radian) * dist;
  const x1 = this.center.x + Math.cos(radian) * dist2;
  const y1 = this.center.y + Math.sin(radian) * dist2;
  const bestPair = this.bestPairFrom(new Point(x1, y1));
  const vertices = this._vertices;
  const pointsA = [];
  const pointsB = [];
  let i;
  for (i = 0; i < vertices.length; i++) {
    const x2 = vertices[i].x - this.x;
    const y2 = vertices[i].y - this.y;
    pointsA.push(new Point(x2, y2));
    pointsB.push(new Point(x2 + xComponent, y2 + yComponent));
  }
  // TODO add the other vertices from collider
  const points = [];
  points.push(pointsA[bestPair[0]]);
  points.push(pointsB[bestPair[0]]);
  points.push(pointsB[bestPair[1]]);
  points.push(pointsA[bestPair[1]]);
  return new Polygon_Collider(points, this.x, this.y);
};
