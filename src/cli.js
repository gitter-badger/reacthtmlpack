import {
  extname as extractExtname,
  dirname as extractDirname,
  basename as extractBasename,
  relative as relativePathOf,
  resolve as resolvePath,
} from "path";

import {
  writeFile as nodeWriteFile,
} from "fs";

import {
  Glob,
} from "glob";

import {
  default as glob2base,
} from "glob2base";

import {
  default as Rx,
  Observable,
} from "rx";

import {
  turnCommandInto,
} from "./core";

const writeFile = Observable.fromNodeCallback(nodeWriteFile);

export function replaceWithHtmlExt (filepath) {
  const dirpath = extractDirname(filepath);

  let basename = extractBasename(filepath);

  while (true) {
    const ext = extractExtname(basename);
    if (ext) {
      basename = extractBasename(basename, ext);
    } else {
      return resolvePath(dirpath, `${ basename }.html`);
    }
  }
}

export function buildToDir (destDir, srcPatterns) {
  return Observable.from(srcPatterns)
    .selectMany(srcPattern => {
      const globber = new Glob(srcPattern);
      const base = glob2base(globber);

      return Rx.Observable.create(function (observer) {
        globber.once("end", matches => {
          observer.onNext({
            base,
            matches,
          });
          observer.onCompleted();
        });
      });
    })
    .reduce((acc, {base, matches}) => {
      acc.matches.push(...matches);
      matches.forEach(match => {

        const filepath = replaceWithHtmlExt(match);
        acc.relativePathByMatch[match] = relativePathOf(base, filepath);
      });

      return acc;
    }, {matches: [], relativePathByMatch: {}})
    .selectMany(({matches, relativePathByMatch}) => {
      return turnCommandInto(matches)
        .map(({filepath, markup}) => {
          const relativePath = relativePathByMatch[filepath];

          return {
            filepath: resolvePath(destDir, relativePath),
            markup,
          };
        });
    })
    .selectMany(({filepath, markup}) => {
      return writeFile(filepath, markup);
    })
    .subscribe(
      ::console.log,
      ::console.error,
      ::console.log,
    );
}
