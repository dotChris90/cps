/* eslint-disable no-plusplus */
/* eslint-disable no-param-reassign */
import * as js_yaml from "js-yaml";
import * as fse from "fs-extra";
import { CMake } from "./cmake";
import { Conan } from "./conan";
import { Pip } from "./pip";
import { ValidationError } from "../error/validation-error";

export class CPSConfig {
  name = "";

  version = "";

  license = "";

  author = "";

  url = "";

  sourceDir = "";

  installDir = "";

  buildDir = "";

  importDir = "";

  pkgDir = "";

  deployDir = "";

  description = "";

  topics: string[] = [];

  cmake: CMake;

  conan: Conan;

  pip: Pip;

  public constructor(init?: Partial<CPSConfig>) {
    Object.assign(this, init);
    if (this.conan !== null) this.conan = new Conan(this.conan);
    else this.conan = new Conan();
    if (this.cmake !== null) this.cmake = new CMake(this.cmake);
    else this.cmake = new CMake();
    if (this.pip !== null) this.pip = new Pip(this.pip);
    else this.pip = new Pip();
    this.validate();
  }

  public validate() {
    if (this.name === "")
      throw new ValidationError("config requires name");
    if (this.version === "")
      throw new ValidationError("config requires version");
    if (this.buildDir === "")
      throw new ValidationError("config requires buildDir");
    if (this.deployDir === "")
      throw new ValidationError("config requires deployDir");
    if (this.pkgDir === "")
      throw new ValidationError("config requires pkgDir");
    if (this.deployDir === "")
      throw new ValidationError("config requires deployDir");  
  }

  public static createFromYMLFile(filePath: string): CPSConfig {
    const partialConfig = js_yaml.load(
      fse.readFileSync(filePath, "utf8")
    ) as CPSConfig;
    return new CPSConfig(partialConfig);
  }

  public static writeToYMLFile(filePath: string, config: CPSConfig): void {
    fse.writeFileSync(
      filePath,
      js_yaml.dump(config, { skipInvalid: true }),
      "utf8"
    );
  }
}
