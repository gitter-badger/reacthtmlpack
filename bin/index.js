#!/usr/bin/env node

var program = require("commander");

var cli = require("../lib").cli;

program.version(require("../package.json").version);

program
  .command("buildToDir <destDir> <srcPatterns...>")
  .description("\n\t\
build all files that matches srcPatterns and writes the generated htmls into destDir.\
The relative of these files to destDir is determined by\
the relative path of the source to srcPatterns\n"
  )
  .action(cli.buildToDir);

program
  .command("watchAndBuildToDir <destDir> <srcPatterns...>")
  .description("\n\t\
Watch and build all files that matches srcPatterns\
and writes the output htmls into destDir. The relative of these files to destDir\
is determined by the relative path of the source to srcPatterns\n"
  )
  .action(cli.watchAndBuildToDir);

program.parse(process.argv);

var emptyArgs = !program.args.length;
var notWhitelistCommand = program.commands.some(function (command) {
  return command.name === program.args[0];
});

var shouldOutputHelp = [emptyArgs, notWhitelistCommand].some(function (it) { return it; });

if (shouldOutputHelp) {
  program.outputHelp();
}
