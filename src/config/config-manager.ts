import { CPSConfig } from "./cps-config";
import { Executable } from "./executable";
import { Package } from "./package";
import { Option } from "./option";
import { Tool } from "./tool";
import { Library } from "./library";

export class ConfigManager {
  public config: CPSConfig;

  constructor(config: CPSConfig) {
    this.config = config;
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

  rmCMakeExeSrc(name: string, src: string) {
    const exe = this.config.cmake.executables.filter((e) => e.name === name)[0];
    const idx = exe.srcs.indexOf(src);
    if (idx > -1) exe.srcs.splice(idx, 1);
  }

  rmCMakeExeLink(name: string, link: string) {
    const exe = this.config.cmake.executables.filter((e) => e.name === name)[0];
    const idx = exe.links.indexOf(link);
    if (idx > -1) exe.links.splice(idx, 1);
  }

  rmCMakeLib(name: string) {
    if (this.config.cmake.libraries.filter((e) => e.name === name).length > 0) {
      const lib = this.config.cmake.libraries.filter((e) => e.name === name)[0];
      const idx = this.config.cmake.libraries.indexOf(lib, 0);
      this.config.cmake.libraries.splice(idx, 1);
    }
  }

  rmCMakeLibSrc(name: string, src: string) {
    const lib = this.config.cmake.libraries.filter((e) => e.name === name)[0];
    const idx = lib.srcs.indexOf(src);
    if (idx > -1) lib.srcs.splice(idx, 1);
  }

  rmCMakeLibLink(name: string, link: string) {
    const lib = this.config.cmake.libraries.filter((e) => e.name === name)[0];
    const idx = lib.links.indexOf(link);
    if (idx > -1) lib.links.splice(idx, 1);
  }

  rmCMakeLibInc(name: string, inc: string) {
    const lib = this.config.cmake.libraries.filter((e) => e.name === name)[0];
    const idx = lib.incs.indexOf(inc);
    if (idx > -1) lib.incs.splice(idx, 1);
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
}
