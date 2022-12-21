import * as path from "path";
import * as cmdExist from 'command-exists';
import * as fse from "fs-extra";
import { ConfigManager } from "../config/config-manager";

export class CMakeGenerator {
  configManager: ConfigManager;

  templateFile: string;

  doxygenFile: string;

  cppcheckFile: string;

  metrixppFile: string;

  public constructor(cpsConfigManager: ConfigManager) {
    this.configManager = cpsConfigManager;
    this.templateFile = path.join(
      __filename,
      "..",
      "templates",
      "CMakeLists.txt"
    );
    this.doxygenFile = path.join(
        __filename,
        "..",
        "templates",
        "doxygen.cmake"
      );
    this.cppcheckFile = path.join(
        __filename,
        "..",
        "templates",
        "cppcheck.cmake"
      );
      this.metrixppFile = path.join(
        __filename,
        "..",
        "templates",
        "metrixpp.cmake"
      );
  }

  public generateCMakeFileTxt(dstFolder : string) {
    let templateContent = fse.readFileSync(this.templateFile).toString();

    let packages = "";
    this.configManager.config.cmake.packages.forEach(e => {
        packages = `${packages}find_package(${e} REQUIRED)\n`;
    })

    let targets : string[] = [];

    // we anyway iterate over all
    let links = "";

    let exes = ""; 
    for(let exe of this.configManager.config.cmake.executables) {
        exes = `${exes}add_executable(${exe.name}\n`;
        for(let src of exe.srcs) {
            exes = `${exes}               "${src}"\n`;
        }
        exes = `${exes})\n`;
        for(let link of exe.links) {
            links = `${links}target_link_libraries(${exe.name} ${link})\n`;
        }
        targets.push(exe.name);
    }

    let libs = ""; 
    let incs = "";
    for(let lib of this.configManager.config.cmake.libraries) {
        libs = `${libs}add_library(${lib.name}\n`;
        for(let src of lib.srcs) {
            libs = `${libs}               "${src}"\n`;
        }
        libs = `${libs})\n`;
        for(let link of lib.links) {
            links = `${links}target_link_libraries(${lib.name} ${link})\n`;
        }
        if (lib.incs.length > 0) {
            incs = `${incs}set_target_properties(${lib.name} PROPERTIES PUBLIC_HEADER \n`;
            for(let inc of lib.incs) {
                incs = `${incs}                      "${inc}"\n`
            }
            incs = `${incs})\n`;
        }
        else {
            // pass 
        }
        targets.push(lib.name);
    }

    let install = "";
    if (targets.length > 0) {
        install = `${install}install(TARGETS`
        for(let target of targets) {
            install = `${install} ${target}`;
        }
        install = `${install} DESTINATION "."\n`;
        install = `${install}        PUBLIC_HEADER DESTINATION include\n`;
        install = `${install}        RUNTIME DESTINATION bin\n`;
        install = `${install}        ARCHIVE DESTINATION lib\n`;
        install = `${install}        LIBRARY DESTINATION lib\n)\n`;
    }
    

    templateContent = templateContent.replace('"${name}"',this.configManager.config.name)
                                     .replace('"${find_package}"', packages)
                                     .replace('"${executables}"', exes)
                                     .replace('"${libraries}"', libs)
                                     .replace('"${links}"',links)
                                     .replace('"${headers}"', incs)
                                     .replace('"${install}"', install);
    
    fse.writeFileSync(path.join(dstFolder,"CMakeLists.txt"), templateContent);
  }
  
  public generateCPSCMakeModule(dstFolder : string) {
    const cfg = this.configManager.config;
    let cpsModuleContent = "";
    if (cfg.conan.tools.filter(e => e.name === "doxygen").length > 0 || cmdExist.sync("doxygen")) {
        cpsModuleContent = `${cpsModuleContent}${fse.readFileSync(this.doxygenFile).toString()}`
    }
    if (cfg.conan.tools.filter(e => e.name === "cppcheck").length > 0 || cmdExist.sync("cppcheck")) {
        cpsModuleContent = `${cpsModuleContent}${fse.readFileSync(this.cppcheckFile).toString()}`
    }
    if (cfg.pip.tools.filter(e => e.name === "metrixpp").length > 0 || cmdExist.sync("metrix++")) {
        cpsModuleContent = `${cpsModuleContent}${fse.readFileSync(this.metrixppFile).toString()}`
    }
    fse.writeFileSync(path.join(dstFolder,"cps.cmake"), cpsModuleContent);
  }
}
