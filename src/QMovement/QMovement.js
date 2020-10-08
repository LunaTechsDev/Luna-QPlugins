function QMovement() {
  throw new Error("This is a static class");
}

var _PARAMS = QPlus.getParams("<Luna_QMovement>", {
  "Player Collider": {
    Type: "box",
    Width: 36,
    Height: 24,
    "Offset X": 6,
    "Offset Y": 24,
  },
  "Event Collider": {
    Type: "box",
    Width: 36,
    Height: 24,
    "Offset X": 6,
    "Offset Y": 24,
  },
  Presets: [],
});

QMovement.grid = _PARAMS["Grid"];
QMovement.tileSize = _PARAMS["Tile Size"];
QMovement.offGrid = _PARAMS["Off Grid"];
QMovement.smartMove = _PARAMS["Smart Move"];
QMovement.midPass = _PARAMS["Mid Pass"];
QMovement.moveOnClick = _PARAMS["Move on click"];
QMovement.diagonal = _PARAMS["Diagonal"];
QMovement.collision = "#FF0000"; // will be changable in a separate addon
QMovement.water1 = "#00FF00"; // will be changable in a separate addon
QMovement.water2 = "#0000FF"; // will be changable in a separate addon
QMovement.water1Tag = 1; // will be changable in a separate addon
QMovement.water2Tag = 2; // will be changable in a separate addon
QMovement.playerCollider = convertColliderStruct(_PARAMS["Player Collider"]);
QMovement.eventCollider = convertColliderStruct(_PARAMS["Event Collider"]);
QMovement.presets = {};
_PARAMS["Presets"].forEach(function (preset) {
  QMovement.presets[preset.ID] = convertColliderStruct(preset);
});
QMovement.showColliders = _PARAMS["Show Colliders"];
QMovement.tileBoxes = {
  1537: [48, 6, 0, 42],
  1538: [6, 48],
  1539: [
    [48, 6, 0, 42],
    [6, 48],
  ],
  1540: [6, 48, 42],
  1541: [
    [48, 6, 0, 42],
    [6, 48, 42],
  ],
  1542: [
    [6, 48],
    [6, 48, 42],
  ],
  1543: [
    [48, 6, 0, 42],
    [6, 48],
    [6, 48, 42],
  ],
  1544: [48, 6],
  1545: [
    [48, 6],
    [48, 6, 0, 42],
  ],
  1546: [
    [48, 6],
    [6, 48],
  ],
  1547: [
    [48, 6],
    [48, 6, 0, 42],
    [6, 48],
  ],
  1548: [
    [48, 6],
    [6, 48, 42],
  ],
  1549: [
    [48, 6],
    [48, 6, 0, 42],
    [6, 48, 42],
  ],
  1550: [
    [48, 6],
    [6, 48],
    [6, 48, 42],
  ],
  1551: [48, 48], // Impassable A5, B
  2063: [48, 48], // Impassable A1
  2575: [48, 48],
  3586: [6, 48],
  3588: [6, 48, 42],
  3590: [
    [6, 48],
    [6, 48, 42],
  ],
  3592: [48, 6],
  3594: [
    [48, 6],
    [6, 48],
  ],
  3596: [
    [48, 6],
    [6, 48, 42],
  ],
  3598: [
    [48, 6],
    [6, 48],
    [6, 48, 42],
  ],
  3599: [48, 48], // Impassable A2, A3, A4
  3727: [48, 48],
};
var rs = QMovement.tileSize / 48;
for (var key in QMovement.tileBoxes) {
  if (QMovement.tileBoxes.hasOwnProperty(key)) {
    for (var i = 0; i < QMovement.tileBoxes[key].length; i++) {
      if (QMovement.tileBoxes[key][i].constructor === Array) {
        for (var j = 0; j < QMovement.tileBoxes[key][i].length; j++) {
          QMovement.tileBoxes[key][i][j] *= rs;
        }
      } else {
        QMovement.tileBoxes[key][i] *= rs;
      }
    }
  }
}
// following will be changable in a separate addon
QMovement.regionColliders = {};
QMovement.colliderMap = {};

function convertColliderStruct(struct) {
  return [
    struct.Type,
    struct.Width,
    struct.Height,
    struct["Offset X"],
    struct["Offset Y"],
  ];
}
