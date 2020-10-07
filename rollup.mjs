import resolve from "rollup-plugin-node-resolve";

import { rollup } from "rollup";
import { promises as fs } from "fs";

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
  sourcemap: true,
};

(async function () {
  const pluginDirs = await fs.readdir("./src/");

  pluginDirs.forEach(async (dir) => {
    if (ignoreDirs.some((i) => i === dir)) {
      return;
    }
    const paramsData = await fs.readFile(`./src/${dir}/Params.js`, "utf8");
    const exportName = await getPluginTag(paramsData, "exportName");

    const bundle = await rollup({
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
      ],
    });

    // Output to MZ demo game
    await bundle.write({
      banner: async () => {
        return await fs.readFile(`./src/${dir}/Params.js`, "utf8");
      },
      name: exportName ? exportName : "",
      file: `./games/mz/js/plugins/Luna_${dir}.js`,
      ...outputOptions,
    });

    // Output to MV demo game
    await bundle.write({
      banner: async () => {
        return await fs.readFile(`./src/${dir}/Params.js`, "utf8");
      },
      name: exportName ? exportName : "",
      file: `./games/mv/js/plugins/Luna_${dir}.js`,
      ...outputOptions,
    });
  });
})();
