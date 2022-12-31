/* eslint-disable promise/always-return */
/* eslint-disable no-constant-condition */
/* eslint-disable unicorn/numeric-separators-style */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable unicorn/import-style */
import * as fse from "fs-extra";
import * as path from "path";
import * as os from "os";
import { Conan } from "./conan";
import { CPSConfig } from "./cps-config";

describe("cps-config", () => {
  describe("test", () => {
    it("shall get full config object", async () => {
      const cpsPath = path.join(__filename, "..", "data", "cps.yml");
      const cpsObj = CPSConfig.createFromYMLFile(cpsPath);

      expect(cpsObj.name).toBe("abc");
      expect(cpsObj.version).toBe("1.2.3");
      expect(cpsObj.cmake.executables[0].name).toBe("main");
      expect(cpsObj.cmake.executables[0].srcsAsSet().has("src/main.cpp")).toBeTruthy();
      expect(cpsObj.conan.packages[0].name).toBe("fmt");
    });

    it("shall have a missing conan config", async () => {
      const cpsPath = path.join(__filename, "..", "data", "cps2.yml");
      const cpsObj = CPSConfig.createFromYMLFile(cpsPath);

      expect(cpsObj.name).toBe("abc");
      expect(cpsObj.version).toBe("1.2.3");
      expect(cpsObj.cmake.executables[0].name).toBe("main");
      expect(cpsObj.cmake.executables[0].srcsAsSet().has("src/main.cpp")).toBeTruthy();
      expect(cpsObj.conan.options.length).toBe(0);
    });

    it("shall have a missing exe config", async () => {
      const cpsPath = path.join(__filename, "..", "data", "cps3.yml");
      const cpsObj = CPSConfig.createFromYMLFile(cpsPath);

      expect(cpsObj.name).toBe("abc");
      expect(cpsObj.version).toBe("1.2.3");
      expect(cpsObj.cmake.executables.length).toBe(0);
    });
  });

  it("shall write right", ()=> {
    const cpsPath = path.join(__filename, "..", "data", "cps4.yml");
    const cpsObj = CPSConfig.createFromYMLFile(cpsPath);

    const prefix = "config";
    const tmpDir = fse.mkdtempSync(path.join(os.tmpdir(), prefix));

    fse.mkdirpSync(tmpDir);

    CPSConfig.writeToYMLFile(path.join(tmpDir,"cps.yml"),cpsObj);

    let a =1;
  })
});
