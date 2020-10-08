import resolve from "rollup-plugin-node-resolve";
import jscc from "rollup-plugin-jscc";

import { rollup } from "rollup";
import { promises as fs } from "fs";

const OUTPUT_DIR =
  process.env.NODE_ENV === "production" ? "./dist/" : "./games/";

const filterText = function (text, regex, action) {
  const result = [];
  let match;
  const re = regex;
  while ((match = re.exec(text))) {
    // eslint-disable-line no-cond-assign
    if (action(match)) {
      result.push(match);
    }
  }
  return result;
};

async function getPluginTag(parameters, tag) {
  try {
    const pattern = new RegExp(`@(${tag})([^\\r\\n]*)`, "g");
    const match = filterText(
      parameters,
      pattern,
      (match) => match[1] === tag
    )[0];

    if (match) {
      return match[2].trim();
    } else {
      return "";
    }
  } catch (error) {
    throw new Error(error);
  }
}

const ignoreDirs = ["utils"];
const external = ["fs-extra", "http", "path"];
const outputOptions = {
  indent: false,
  format: "iife",
  sourcemap: process.env.NODE_ENV !== "production",
};

(async function () {
  const pluginDirs = await fs.readdir("./src/");

  pluginDirs.forEach(async (dir) => {
    if (ignoreDirs.some((i) => i === dir)) {
      return;
    }
    const paramsData = await fs.readFile(`./src/${dir}/Params.js`, "utf8");
    const exportName = await getPluginTag(paramsData, "exportName");

    const bundleMZ = await rollup({
      input: `./src/${dir}/main.js`,
      external,
      onwarn(warning, warn) {
        // suppress eval warnings
        if (warning.code === "EVAL") {
          return;
        }
        warn(warning);
      },
      plugins: [
        resolve({
          mainFields: ["module", "main"],
        }),
        jscc({
          values: { _MV: false },
        }),
      ],
    });

    await bundleMZ.write({
      banner: async () => {
        return await fs.readFile(`./src/${dir}/Params.js`, "utf8");
      },
      name: exportName ? exportName : "",
      file: `${OUTPUT_DIR}/mz/js/plugins/Luna_${dir}.js`,
      ...outputOptions,
    });

    const bundleMV = await rollup({
      input: `./src/${dir}/main.js`,
      external,
      onwarn(warning, warn) {
        // suppress eval warnings
        if (warning.code === "EVAL") {
          return;
        }
        warn(warning);
      },
      plugins: [
        resolve({
          mainFields: ["module", "main"],
        }),
        jscc({
          values: { _MV: true },
        }),
      ],
    });

    await bundleMV.write({
      banner: async () => {
        return await fs.readFile(`./src/${dir}/Params.js`, "utf8");
      },
      name: exportName ? exportName : "",
      file: `${OUTPUT_DIR}/mv/js/plugins/Luna_${dir}.js`,
      ...outputOptions,
    });
  });
})();
