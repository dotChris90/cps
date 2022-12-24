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

        await conan.importHeaders(
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

    it("shall inspect package", async() => {


        const fake = new FakeOutput();
        const exe = new Executor(fake);
        const conan = new ConanAPI(fake,exe);

        const obj = conan.inspectPkg("iceoryx","2.0.2");

        expect(obj.author).toBe(null);
        expect(obj.name).toBe("iceoryx");
        expect(obj.version).toBe("2.0.2");
        expect(obj.deepRequires.size).toBe(3);
        
    });

    it("shall just build the test", async() => {

        const fake = new FakeOutput();
        const exe = new Executor(fake);
        const conan = new ConanAPI(fake,exe);

        const prefix = "conan-api-test";
        const tmpDir = fse.mkdtempSync(path.join(os.tmpdir(), prefix));

        fse.mkdirpSync(tmpDir);

        fse.copySync(
            path.join(__filename,"..","..","data","newWithTest"),
            path.join(tmpDir,"new")
        );

        await conan.buildTest(
            "default",
            "default",
            "Release",
            path.join(tmpDir,"new","conanfile.py"),
            path.join(tmpDir,"new","test_package","conanfile.py")
        );

        expect(fse.existsSync(path.join(tmpDir,"new","test_package","build","Release","example"))).toBeTruthy();
        fse.rmSync(tmpDir,{recursive:true});
    });

    it("shall install pkgs and build", async() => {

        const fake = new FakeOutput();
        const exe = new Executor(fake);
        const conan = new ConanAPI(fake,exe);

        const prefix = "conan-api-test";
        const tmpDir = fse.mkdtempSync(path.join(os.tmpdir(), prefix));

        fse.mkdirpSync(tmpDir);

        fse.copySync(
            path.join(__filename,"..","..","data","new"),
            path.join(tmpDir,"new")
        );


        fse.mkdirpSync(path.join(tmpDir,"new","build"));

        await conan.install(
            "default",
            "default",
            "Release",
            path.join(tmpDir,"new", "conanfile.py"),
            path.join(tmpDir,"new", "build")
        );

        await conan.build(
            path.join(tmpDir,"new", "conanfile.py"),
            path.join(tmpDir,"new", "build") 
        );

        expect(fse.existsSync(path.join(tmpDir,"new","build","Release","abc"))).toBeTruthy();

        fse.rmSync(tmpDir,{recursive:true});
    });

    it("deploy package", async() => {

        const fake = new FakeOutput();
        const exe = new Executor(fake);
        const conan = new ConanAPI(fake,exe);

        const prefix = "conan-api-test";
        const tmpDir = fse.mkdtempSync(path.join(os.tmpdir(), prefix));

        fse.mkdirpSync(tmpDir);
        fse.mkdirpSync(path.join(tmpDir,"deploy"));

        fse.copySync(
            path.join(__filename,"..","..","data","new"),
            path.join(tmpDir,"new")
        );

        await conan.deploy(
            "default",
            "default",
            "Release",
            path.join(tmpDir,"new","conanfile.py"),
            path.join(tmpDir,"deploy")
        );

        expect(fse.existsSync(path.join(tmpDir,"deploy","all","include","fmt"))).toBeTruthy();
        expect(fse.existsSync(path.join(tmpDir,"deploy","all","include","gsl"))).toBeTruthy();
        expect(fse.existsSync(path.join(tmpDir,"deploy","all","lib","libfmt.a"))).toBeTruthy();
        expect(fse.existsSync(path.join(tmpDir,"deploy","all","bin","abc"))).toBeTruthy();
        

        fse.rmSync(tmpDir, {recursive:true});
    })
  });
});
