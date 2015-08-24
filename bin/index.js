#!/usr/bin/env node

var program = require("commander");

var cli = require("../lib").cli;

program.version(require("../package.json").version);

program
  .command("buildToDir <destDir> <srcPatterns...>")
  .description("build all files that matches srcPatterns and writes the output htmls into destDir. The relative of these files to destDir is determined by the relative path of the source to srcPatterns")
  .action(cli.buildToDir);

program
  .command("watchAndBuildToDir <destDir> <srcPatterns...>")
  .description("Watch and build all files that matches srcPatterns and writes the output htmls into destDir. The relative of these files to destDir is determined by the relative path of the source to srcPatterns")
  .action(cli.watchAndBuildToDir);

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
