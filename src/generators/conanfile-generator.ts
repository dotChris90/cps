import * as path from "path";
import * as fse from "fs-extra";
import { ConfigManager } from "../config/config-manager";

export class ConanfileGenerator {
  configManager: ConfigManager;

  templateFile: string;

  testTemplateFile : string;

  public constructor(cpsConfigManager: ConfigManager) {
    this.configManager = cpsConfigManager;
    this.templateFile = path.join(
      __filename,
      "..",
      "templates",
      "conanfile.py"
    );
    this.testTemplateFile = path.join(
      __filename,
      "..",
      "templates",
      "new",
      "test_package",
      "conanfile.py"
    );
  }

  public generateConanfilePy(folderDst: string) {
    let templateContent = fse.readFileSync(this.templateFile).toString();
    let config = this.configManager.config;
    const topics = " (\n$ARGS\n    )".replace(
      "$ARGS",
      '    "' + config.topics.join('",\n    "') + '"'
    );
    let options = "options = {}\n";
    let defaultOptions = "default_options = {}\n";
    if (config.conan.options.length === 0) {
      // pass
    } else {
      for (let option of config.conan.options) {
        options = `${options}    options["${
          option.name
        }"] = ["${option.values.join('","')}"]\n`;
        defaultOptions = `${defaultOptions}    default_options["${option.name}"] = "${option.default}"\n`;
      }
    }

    let configMethod = "";
    if (config.conan.options.filter((e) => e.name === "shared").length > 0) {
      configMethod =
        '    def config_options(self):\n        if self.settings.os == "Windows":\n            del self.options.fPIC\n';
    } else {
      configMethod = "    def config_options(self):\n        pass\n";
    }

    let requiresMethod = "";
    if (config.conan.packages.length > 0) {
      requiresMethod = "    def requirements(self):\n        ";
      for (let pkg of config.conan.packages) {
        requiresMethod = `${requiresMethod}self.requires("${pkg.name}/${pkg.version}")\n        `;
      }
    } else {
      requiresMethod = "    def requirements(self):\n        pass\n\n";
    }

    let buildRequiresMethod = "";
    if (config.conan.tools.length > 0) {
      buildRequiresMethod = "    def build_requirements(self):\n        ";
      for (let pkg of config.conan.tools) {
        buildRequiresMethod = `${buildRequiresMethod}self.tool_requires("${pkg.name}/${pkg.version}")\n        `;
      }
    } else {
      buildRequiresMethod =
        "    def build_requirements(self):\n        pass\n\n";
    }

    templateContent = templateContent
      .replace("{{package_name}}", config.name.toUpperCase())
      .replace("{{ name }}", config.name)
      .replace("{{ version }}", config.version)
      .replace("{{license}}", config.license)
      .replace("{{author}}", config.author)
      .replace("{{url}}", config.url)
      .replace("{{description}}", config.description)
      .replace("{{topics}}", topics)
      .replace("{{package_option}}", options)
      .replace("{{default_option}}", defaultOptions)
      .replace("    {{config_options}}", configMethod)
      .replace("    {{requirements}}", requiresMethod)
      .replace("    {{build_requirements}}", buildRequiresMethod);

    fse.writeFileSync(path.join(folderDst,"conanfile.py"), templateContent);
  }

  public generateConanFileTxt(folderDst: string) {

  }

  public generateConanTestFilePy(folderDst : string) {
    let templateContent = fse.readFileSync(this.testTemplateFile).toString();
    let config = this.configManager.config;
    templateContent = templateContent.replace("{{package_name}}", config.name.toUpperCase());

    fse.writeFileSync(path.join(folderDst,"conanfile.py"),templateContent);
  }
}
