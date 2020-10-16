const ColliderManager = QMovement.ColliderManager;

let $dataQMapInfos = null;
let $dataQMap = null;

function setQMapData(data) {
  $dataQMap = data;
}

function setQMapInfos(data) {
  $dataQMapInfos = data;
}

function getQMapData() {
  return $dataQMap;
}

function getQMapInfos() {
  return $dataQMapInfos;
}

export {
  ColliderManager,
  setQMapData,
  getQMapData,
  setQMapInfos,
  getQMapInfos,
};
