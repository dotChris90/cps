import { CPSConfig } from "./cps-config";
import { Executable } from "./executable";
import { Package } from "./package";
import { Option } from "./option";
import { Tool } from "./tool";
import { Library } from "./library";
import { Pip } from "./pip";
import {Utils} from '../utils/utils';
import { link } from "fs-extra";

export class ConfigManager {
  public config: CPSConfig;

  public ymlFilePath : string;

  constructor(config: CPSConfig, ymlFilePath : string) {
    this.config = config;
    this.ymlFilePath = ymlFilePath;
  }

  SetMinimalData(
    name: string,
    version: string,
    license: string,
    author: string,
    url: string,
    description: string,
    topics: string[]
  ) {
    this.config.name = name;
    this.config.description = description;
    this.config.version = version;
    this.config.license = license;
    this.config.author = author;
    this.config.url = url;
    this.config.topics = topics;
  }

  public getCMakeTargets() : Array<Library | Executable> {
    let allTargets : Array<Library|Executable> = [];
    this.config.cmake.executables.forEach(e => allTargets.push(e));
    this.config.cmake.libraries.forEach(e => allTargets.push(e));
    return allTargets;
  }

  public doesTargetHasSrc(target : string,src : string) {
    return this.getCMakeTargets()
               .filter(t => t.name === target)[0]
               .srcsAsSet().has(src);
  }

  public doesLibHasInc(target : string,inc : string) {
    return this.config.cmake.libraries
               .filter(t => t.name === target)[0]
               .incsAsSet().has(inc);
  }

  public setSrcs2Target(target : string, srcs : string[]) {
    const targetObj = this.getCMakeTargets().filter(t => t.name === target)[0];
    const srcSet = new Set<string>(srcs);
    targetObj.srcs = [];
    srcSet.forEach(src => targetObj.srcs.push(src));
  }

  public setIncs2Lib(target : string, incs : string[]) {
    const targetObj = this.config.cmake.libraries
                          .filter(t => t.name === target)[0];
    const incSet = new Set<string>(incs);
    targetObj.incs = [];
    incSet.forEach(inc => targetObj.incs.push(inc));                    
  }

  public validateSrcsInTargets(srcs : string[]) : void {
    let srcsSet = new Set<string>(srcs);
    let targets = this.getCMakeTargets();
    targets.forEach(t => {
      let missing = Utils.notIn(t.srcsAsSet(),srcsSet);
      missing.forEach(s => {
        const index = t.srcs.indexOf(s, 0);
        if (index > -1) {
          t.srcs.splice(index, 1);
        }
      });
    });
  }

  public validateLinksInTargets(links : string[]) : void {
    let linksSet = new Set<string>(links);
    let targets = this.getCMakeTargets();
    targets.forEach(t => {
      let missing = Utils.notIn(t.linksAsSet(),linksSet);
      missing.forEach(s => {
        const index = t.links.indexOf(s, 0);
        if (index > -1) {
          t.links.splice(index, 1);
        }
      });
    });
  }

  public validateIncsInLibs(incs : string[]) : void {
    let incsSet = new Set<string>(incs);
    let targets = this.config.cmake.libraries;
    targets.forEach(t => {
      let missing = Utils.notIn(t.incsAsSet(),incsSet);
      missing.forEach(s => {
        const index = t.incs.indexOf(s, 0);
        if (index > -1) {
          t.incs.splice(index, 1);
        }
      });
    });
  }


  addPipPackage(name: string, version: string) {
    if (this.config.pip.tools.filter((e) => e.name === name).length === 0) {
      const pipPkg = new Tool();
      pipPkg.name = name;
      pipPkg.version = version;
      this.config.pip.tools.push(pipPkg);
    }
  }

  rmPipPackage(name: string) {
    if (this.config.pip.tools.filter((e) => e.name === name).length > 0) {
      const tool = this.config.pip.tools.filter((e) => e.name === name)[0];
      const idx = this.config.pip.tools.indexOf(tool);
      if (idx > -1) this.config.pip.tools.splice(idx, 1);
    }
  }

  addCMakeExe(name: string, srcs: string[], links: string[]) {
    if (
      this.config.cmake.executables.filter((e) => e.name === name).length === 0
    ) {
      const exe = new Executable();
      exe.name = name;
      exe.links = links;
      exe.srcs = srcs;
      this.config.cmake.executables.push(exe);
    }
  }

  addCMakeExeSrc(name: string, src: string) {
    const exe = this.config.cmake.executables.filter((e) => e.name === name)[0];
    exe.srcs.push(src);
  }

  addCMakeExeLink(name: string, link: string) {
    const exe = this.config.cmake.executables.filter((e) => e.name === name)[0];
    exe.links.push(link);
  }

  addCMakeLib(name: string, srcs: string[], incs: string[], links: string[]) {
    if (
      this.config.cmake.libraries.filter((e) => e.name === name).length === 0
    ) {
      const lib = new Library();
      lib.name = name;
      lib.links = links;
      lib.srcs = srcs;
      lib.incs = incs;

      this.config.cmake.libraries.push(lib);
    }
  }

  addCMakeLibSrc(name: string, src: string) {
    const lib = this.config.cmake.libraries.filter((e) => e.name === name)[0];
    lib.srcs.push(src);
  }

  addCMakeLibLink(name: string, link: string) {
    const lib = this.config.cmake.libraries.filter((e) => e.name === name)[0];
    lib.links.push(link);
  }

  addCMakeLibInc(name: string, inc: string) {
    const lib = this.config.cmake.libraries.filter((e) => e.name === name)[0];
    lib.incs.push(inc);
  }

  rmCMakeExe(name: string) {
    if (
      this.config.cmake.executables.filter((e) => e.name === name).length > 0
    ) {
      const exe = this.config.cmake.executables.filter(
        (e) => e.name === name
      )[0];
      const idx = this.config.cmake.executables.indexOf(exe, 0);
      this.config.cmake.executables.splice(idx, 1);
    }
  }

  rmCMakeLib(name: string) {
    if (this.config.cmake.libraries.filter((e) => e.name === name).length > 0) {
      const lib = this.config.cmake.libraries.filter((e) => e.name === name)[0];
      const idx = this.config.cmake.libraries.indexOf(lib, 0);
      this.config.cmake.libraries.splice(idx, 1);
    }
  }

  addConanPackage(
    name: string,
    version: string,
    options: Map<string, string> = new Map<string, string>()
  ) {
    if (
      this.config.conan.packages.filter((e) => e.name === name).length === 0
    ) {
      const pkg = new Package();
      pkg.name = name;
      pkg.version = version;
      pkg.options = options;
      this.config.conan.packages.push(pkg);
    }
  }

  addConanOption(name: string, values: string[], defaultValue: string) {
    if (this.config.conan.options.filter((e) => e.name === name).length === 0) {
      const option = new Option();
      option.name = name;
      option.values = values;
      option.default = defaultValue;
      this.config.conan.options.push(option);
    }
  }

  addConanTool(
    name: string,
    version: string,
    options: Map<string, string> = new Map<string, string>()
  ) {
    if (this.config.conan.tools.filter((e) => e.name === name).length === 0) {
      const tool = new Tool();
      tool.name = name;
      tool.version = version;
      tool.options = options;
      this.config.conan.tools.push(tool);
    }
  }

  rmConanPackage(name: string) {
    if (this.config.conan.packages.filter((e) => e.name === name).length > 0) {
      const pkg = this.config.conan.packages.filter((e) => e.name === name)[0];
      const idx = this.config.conan.packages.indexOf(pkg, 0);
      this.config.conan.packages.splice(idx, 1);
    }
  }

  rmConanTool(name: string) {
    if (this.config.conan.tools.filter((e) => e.name === name).length > 0) {
      const pkg = this.config.conan.tools.filter((e) => e.name === name)[0];
      const idx = this.config.conan.tools.indexOf(pkg, 0);
      this.config.conan.tools.splice(idx, 1);
    }
  }

  rmConanOption(name: string) {
    if (this.config.conan.options.filter((e) => e.name === name).length > 0) {
      const opt = this.config.conan.options.filter((e) => e.name === name)[0];
      const idx = this.config.conan.options.indexOf(opt, 0);
      this.config.conan.options.splice(idx, 1);
    }
  }

  public static createFromYmlFile(ymlFile : string) {
    return (new ConfigManager(CPSConfig.createFromYMLFile(ymlFile),ymlFile));
  }
}
