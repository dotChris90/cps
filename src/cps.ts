import * as commander from 'commander';
import * as path from 'path';
import { Console } from './Console';
import { CPSAPI } from './cps-api';


const cli = new commander.Command();

cli.name("cps")
   .description("Deliver C/C++ project support")
   .version("0.0.1")

cli.command("new")
   .description("new C/C++ project")
   .addOption(new commander.Option("-n, --name <name>","name of project").default("",""))
   .addOption(new commander.Option("-v, --version <version>","version of project").default("",""))
   .addOption(new commander.Option("-d, --destination <dst>","destination of project").default("",""))
   .addOption(new commander.Option("-l --license <lic>","license of project").default("",""))
   .action((options) => {
      CPSAPI.createTerminalBased().apiNewProject(
       options.destination,
       options.name,
       options.version,
       options.license
      ).then( () => process.exit()); 
   })

cli.command("generate")
   .description("generate")
   .action(( option) => {
       CPSAPI.createTerminalBased().apiGenerate(
           ).then( () => process.exit());
   });

cli.command("install")
   .description("Install packages to C/C++ project")
   .addOption(new commander.Option("--profile <profile>","conan profile").default("",""))
   .addOption(new commander.Option("--build-type <buildType>","Debug or Release").default("",""))
   .addOption(new commander.Option("--noImport","do not import header of packages").default(false,"import"))
   .action(( option) => {
       CPSAPI.createTerminalBased().apiInstall(
           option.profile,
           option.buildType,
           !option.noImport
           ).then( () => process.exit());
   });

cli.command("build")
   .description("build")
   .action(( option) => {
       CPSAPI.createTerminalBased().apiBuild(
        ).then( () => process.exit());
   });

cli.command("package")
   .description("package")
   .addOption(new commander.Option("--profile <profile>","conan profile").default("",""))
   .addOption(new commander.Option("--build-type <buildType>","Debug or Release").default("",""))
   .action(( option) => {
       CPSAPI.createTerminalBased().apiPackage(
        option.profile,
        option.buildType
        ).then( () => process.exit());
   });

cli.command("test")
   .description("test package")
   .addOption(new commander.Option("--justBuild <yesORNo>","just build dont execute").default("",""))
   .addOption(new commander.Option("--build-type <buildType>","Debug or Release").default("",""))
   .action(( option) => {
       CPSAPI.createTerminalBased().apiTest(
        option.profile,
        option.justBuild
        ).then( () => process.exit());
   });


cli.parseAsync();