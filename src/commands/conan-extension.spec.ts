import * as fse from "fs-extra";
import * as path from "path";
import * as os from 'os';
import { ConanExtAPI } from "./conan-extension";
import {Executor} from './executor';
import {FakeOutput} from '../output/fake-output';

describe("conan-ext", () => {
  describe("test", () => {
    it("get targets", async () => {
        const fake = new FakeOutput();
        const exe = new Executor(fake);
        const conan = new ConanExtAPI(exe);

        let targets = await conan.getTargetsOfConanPkgs(["ms-gsl/4.0.0"]);
        expect(targets.length).toBe(2);

        targets = await conan.getTargetsOfConanPkgs(["fmt/8.1.1"]);
        expect(targets.length).toBe(1);

        targets = await conan.getTargetsOfConanPkgs(["fmt/8.1.1","ms-gsl/4.0.0"]);
        expect(targets.length).toBe(3);

        });
    });
});
