/* eslint-disable promise/always-return */
/* eslint-disable no-constant-condition */
/* eslint-disable unicorn/numeric-separators-style */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable unicorn/import-style */
import * as fse from "fs-extra";
import * as path from "path";
import { Conan } from "./conan";
import { CPSConfig } from "./cps-config";
import { ConfigManager } from "./config-manager";

describe("config-manager", () => {
  describe("test", () => {
    it("shall manage cmake config", async () => {
      const cpsPath = path.join(__filename, "..", "data", "min.yml");
      const cpsObj = CPSConfig.createFromYMLFile(cpsPath);

      const configManager = new ConfigManager(cpsObj);

      expect(cpsObj.cmake.executables.length).toBe(0);
      expect(cpsObj.cmake.libraries.length).toBe(0);

      configManager.addCMakeExe("main", ["src/main.cpp"], []);
      expect(cpsObj.cmake.executables.length).toBe(1);
      configManager.rmCMakeExe("main");
      expect(cpsObj.cmake.executables.length).toBe(0);

      configManager.addCMakeLib(
        "main",
        ["src/main.cpp"],
        ["src/greet.hpp"],
        []
      );
      expect(cpsObj.cmake.libraries.length).toBe(1);
      configManager.rmCMakeLib("main");
      expect(cpsObj.cmake.libraries.length).toBe(0);
    });

    it("shall manage conan config", async () => {
      const cpsPath = path.join(__filename, "..", "data", "min.yml");
      const cpsObj = CPSConfig.createFromYMLFile(cpsPath);

      const configManager = new ConfigManager(cpsObj);

      expect(cpsObj.conan.options.length).toBe(0);
      expect(cpsObj.conan.packages.length).toBe(0);
      expect(cpsObj.conan.tools.length).toBe(0);

      configManager.addConanPackage("abc", "1.2.3");
      expect(cpsObj.conan.packages.length).toBe(1);
      configManager.rmConanPackage("abc");
      expect(cpsObj.conan.packages.length).toBe(0);

      configManager.addConanTool("abc", "1.2.3");
      expect(cpsObj.conan.tools.length).toBe(1);
      configManager.rmConanTool("abc");
      expect(cpsObj.conan.tools.length).toBe(0);

      configManager.addConanOption("shared", ["true", "false"], "false");
      expect(cpsObj.conan.options.length).toBe(1);
      expect(cpsObj.conan.options[0].name).toBe("shared");
      expect(cpsObj.conan.options[0].default).toBe("false");
      configManager.rmConanOption("shared");
      expect(cpsObj.conan.options.length).toBe(0);
    });
  });
});
