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
import { CMakeGenerator } from "./cmakefile-generator";

describe("cmakefile-generator", () => {
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
      const cmpCMake =  path.join(__filename, "..", "data", "CMakeLists.txt");
      const cpsObj = CPSConfig.createFromYMLFile(cpsPath);
      const manager = new ConfigManager(cpsObj);

      const gen = new CMakeGenerator(manager);

      const prefix = "cmake-test";

      const tmpDir = fse.mkdtempSync(path.join(os.tmpdir(), prefix));
      const tmpConanFile = path.join(tmpDir, "CMakeLists.txt");

      gen.generateCMakeFileTxt(tmpConanFile);

      const desiredContent = fse.readFileSync(cmpCMake).toString();
      const writtenContent = fse.readFileSync(tmpConanFile).toString();

      expect(writtenContent).toBe(desiredContent);

      fse.rmSync(tmpDir, { recursive: true });
    });
  });
});
