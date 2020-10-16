import { setQMapInfos } from "./constants";

QPlus.request("data/QMap.json")
  .onSuccess(function (json) {
    const newJson = ["2"];
    if (json[0] !== "2") {
      // convert old json type to new
      if (Utils.isOptionValid("test")) {
        const fs = require("fs");
        const path = require("path");
        const dataPath = path.join(
          path.dirname(process.mainModule.filename),
          "data/"
        );
        const qMapPath = path.join(dataPath, "QMaps/");
        if (!fs.existsSync(qMapPath)) {
          fs.mkdirSync(qMapPath);
        }
        for (let i = 1; i < json.length; i++) {
          const map = json[i];
          if (map && map.length > 0) {
            newJson[i] = true;
            const filename = "QMap%1.json".format(i.padZero(3));
            fs.writeFileSync(
              path.join(qMapPath, filename),
              JSON.stringify(map)
            );
          }
        }
        fs.writeFileSync(
          path.join(dataPath, "QMap.json"),
          JSON.stringify(newJson)
        );
        setQMapInfos(newJson);
      } else {
        alert("Invalid QMap datatype");
        window.close();
      }
    } else {
      setQMapInfos(newJson);
    }
  })
  .onError(function () {
    throw new Error("Failed to load 'data/QMap.json'");
  });
