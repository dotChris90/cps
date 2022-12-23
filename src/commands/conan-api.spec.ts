/* eslint-disable promise/always-return */
/* eslint-disable no-constant-condition */
/* eslint-disable unicorn/numeric-separators-style */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable unicorn/import-style */
import * as fse from "fs-extra";
import * as path from "path";
import * as os from 'os';
import { Conan } from "../config/conan";
import { ConanAPI } from "./conan-api";
import {Executor} from './executor';
import {FakeOutput} from '../output/fake-output';

describe("conan-api", () => {
  describe("test", () => {
    it("shall install headers proper", async () => {
        const fake = new FakeOutput();
        const exe = new Executor(fake);
        const conan = new ConanAPI(fake,exe);

        const prefix = "conan-api-test";
        const tmpDir = fse.mkdtempSync(path.join(os.tmpdir(), prefix));

        fse.copyFileSync(
            path.join(__filename,
                "..",
                "..",
                "data",
                "conanfile2.py"),
            path.join(tmpDir,"conanfile.py")
        );

        fse.mkdirpSync(path.join(tmpDir,"build"));

        await conan.deployHeaders(
            "default",
            "default",
            "Release",
            path.join(tmpDir,"conanfile.py"),
            path.join(tmpDir,"build")
        );

        expect(fse.existsSync(path.join(tmpDir,"build","include","fmt"))).toBeTruthy();
        expect(fse.existsSync(path.join(tmpDir,"build","include","gsl"))).toBeTruthy();

        fse.rmSync(tmpDir,{recursive:true});
    });
  });
});
