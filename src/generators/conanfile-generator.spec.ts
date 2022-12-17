/* eslint-disable promise/always-return */
/* eslint-disable no-constant-condition */
/* eslint-disable unicorn/numeric-separators-style */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable unicorn/import-style */
import * as fse from "fs-extra";
import * as path from "path";
import * as os from "os";
import { ConfigManager } from "../config/config-manager";
import { CPSConfig } from "../config/cps-config";
import { ConanfileGenerator } from "./conanfile-generator";

describe("conanfile-generator", () => {
  describe("test", () => {
    it("shall get full config object", async () => {
      const cpsPath = path.join(
        __filename,
        "..",
        "..",
        "config",
        "data",
        "cps.yml"
      );
      const cmpConanfile = path.join(__filename, "..", "data", "conanfile.py");
      const cpsObj = CPSConfig.createFromYMLFile(cpsPath);
      const manager = new ConfigManager(cpsObj);

      const gen = new ConanfileGenerator(manager);

      const prefix = "conanfile-test";

      const tmpDir = fse.mkdtempSync(path.join(os.tmpdir(), prefix));
      const tmpConanFile = path.join(tmpDir, "conanfile.py");

      gen.generateConanfile(tmpConanFile);

      expect((await fse.readFile(tmpConanFile)).toString()).toBe(
        await fse.readFile(cmpConanfile)
      );

      fse.rmSync(tmpDir, { recursive: true });
    });
  });
});
