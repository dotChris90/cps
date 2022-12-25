/* eslint-disable promise/always-return */
/* eslint-disable no-constant-condition */
/* eslint-disable unicorn/numeric-separators-style */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable unicorn/import-style */
import * as fse from "fs-extra";
import * as path from "path";
import * as os from 'os';
import * as cps from './cps-api';
import { ConfigManager } from "./config/config-manager";

describe("cps-api", () => {
  describe("test", () => {
    it("shall create new project", async () => {

        const prefix = "cps-test";
        const tmpDir = fse.mkdtempSync(path.join(os.tmpdir(), prefix));

        const cpsObj = cps.CPSAPI.createFakeBased();
        cpsObj.newProject(
            tmpDir,
            "cpsTest",
            "0.1.0",
            "MIT"
        );

        const cpsContent = fse.readFileSync(
            path.join(
                __filename,
                "..",
                "data",
                "cps.yml"
            )
        ).toString();

        const cpsTrueContent = fse.readFileSync(
            path.join(tmpDir,"cpsTest","cps.yml")
        ).toString();

        expect(cpsTrueContent).toBe(cpsContent);
        expect(fse.existsSync(path.join(tmpDir,"cpsTest","Doxyfile"))).toBeTruthy();
        expect(fse.existsSync(path.join(tmpDir, "cpsTest" ,"src" , "Greeter.cpp"))).toBeTruthy();
        expect(fse.existsSync(path.join(tmpDir, "cpsTest" ,"src" , "Greeter.hpp"))).toBeTruthy();
        expect(fse.existsSync(path.join(tmpDir, "cpsTest" ,"src" , "main.cpp"))).toBeTruthy();
        
        fse.rmSync(tmpDir, {recursive: true});
    });

    it("shall generate conanfile.py", async() => {
      
        const prefix = "cps-test";
        const tmpDir = fse.mkdtempSync(path.join(os.tmpdir(), prefix));

        fse.copyFileSync(
            path.join(
                __filename,
                "..",
                "data",
                "cps.yml"
            ),
            path.join(tmpDir,"cps.yml")
        );

        const cpsObj = cps.CPSAPI.createFakeBased(ConfigManager.createFromYmlFile(path.join(tmpDir,"cps.yml")));
        cpsObj.generateConanfilePy();

        const desiredContent = fse.readFileSync(
            path.join(__filename,"..","data","conanfile.py")
        ).toString();
        const trueContent = fse.readFileSync(
            path.join(tmpDir,"conanfile.py")
        ).toString();
        
        expect(trueContent).toBe(desiredContent);

        fse.rmSync(tmpDir, { recursive: true});
    });

    it("shall generate CMakeLists", async() => {
      
        const prefix = "cps-test";
        const tmpDir = fse.mkdtempSync(path.join(os.tmpdir(), prefix));

        fse.copyFileSync(
            path.join(
                __filename,
                "..",
                "data",
                "cps.yml"
            ),
            path.join(tmpDir,"cps.yml")
        );

        const cpsObj = cps.CPSAPI.createFakeBased(ConfigManager.createFromYmlFile(path.join(tmpDir,"cps.yml")));
        cpsObj.generateCMakeLists();

        const desiredContent = fse.readFileSync(
            path.join(__filename,"..","data","CMakeLists.txt")
        ).toString();
        const trueContent = fse.readFileSync(
            path.join(tmpDir,"CMakeLists.txt")
        ).toString();
        
        expect(trueContent).toBe(desiredContent);

        fse.rmSync(tmpDir, { recursive: true});
    });
  });
});
