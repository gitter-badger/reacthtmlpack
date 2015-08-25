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
  comp,
  map,
  filter,
  identity,
} from "transducers-js";

import {
  default as WebpackDevServer,
} from "webpack-dev-server";

import {
  default as webpack,
} from "webpack";

import {
  default as _,
} from "lodash";

import {
  xfFilepath$ToWebpackConfig$,

  filepath$ToBabelResult$,
  babelResult$ToReactElement$,
  reactElement$ToChunkList$,
  chunkList$ToWebpackConfig$,
  webpackConfig$ToWebpackCompiler$,
  webpackConfig$ToChunkList$,
  chunkList$ToStaticMarkup$,
  // @package
  mergeWebpackStats$ToChunkList$WithWebpackConfig$,
} from "./core";

const writeFile = Observable.fromNodeCallback(nodeWriteFile);

/**
 * @public
 */
export function buildToDir (destDir, srcPatternList) {
  const {filepath$, relativePathByMatch$} = getMatchResult(srcPatternList);

  const xf = comp(...[
    xfFilepath$ToWebpackConfig$,
    map(webpackConfig$ToChunkList$),
    map(chunkList$ToStaticMarkup$),
    map(staticMarkup$ => {
      return staticMarkup$
        .combineLatest(relativePathByMatch$,
          ({filepath, markup}, relativePathByMatch) => {
            const relativePath = relativePathByMatch[filepath];

            return {
              filepath: resolvePath(destDir, relativePath),
              markup,
            };
          }
        )
        .selectMany(({filepath, markup}) => {
          return writeFile(filepath, markup);
        });
    }),
  ]);

  Observable.of(filepath$)
    .transduce(xf)
    .concatAll()
    .subscribe(
      ::console.log,
      ::console.error,
      () => { console.log("done!"); }
    );
}

/**
 * @public
 */
export function watchAndBuildToDir (destDir, srcPatternList) {
  const {filepath$, relativePathByMatch$} = getMatchResult(srcPatternList);

  const xf = comp(...[
    map(chunkList$ToStaticMarkup$),
    map(staticMarkup$ => {
      return staticMarkup$
        .combineLatest(relativePathByMatch$,
          ({filepath, markup}, relativePathByMatch) => {
            const relativePath = relativePathByMatch[filepath];

            return {
              filepath: resolvePath(destDir, relativePath),
              markup,
            };
          }
        )
        .selectMany(({filepath, markup}) => {
          return writeFile(filepath, markup);
        });
    }),
  ]);

  Observable.of(filepath$)
    .transduce(xfFilepath$ToWebpackConfig$)
    .selectMany(webpackConfig$ => {
      // Why selectMany? Because watch could be repeative.
      // Instead of wrapping one value, now a series of values are emitted.
      return Observable.of(webpackConfig$)
        .map(webpackConfig$ToWebpackCompiler$)
        .combineLatest(
          webpackConfig$.count(),
          (webpackCompiler$, count) => ({webpackCompiler$, count})
        )
        .selectMany(({webpackCompiler$, count}) => {
          return Observable.of(webpackCompiler$)
            .map(watchMultiCompiler$ToChildrenStats$)
            .selectMany(identity)
            .scan((acc, {index, statsJson}) => {
              acc = [...acc];

              acc[index] = statsJson;

              return acc;
            }, new Array(count))
            .takeWhile(acc => acc.every(identity))
            .map(acc => Observable.fromArray(acc));
        })
        .map(mergeWebpackStats$ToChunkList$WithWebpackConfig$(webpackConfig$))
    })
    .transduce(xf)
    .concatAll()
    .subscribe(
      ::console.log,
      ::console.error,
      () => { console.log("done!"); }
    );
}

/**
 * @public
 */
export function devServer (relativeDevServerConfigFilepath, destDir, srcPatternList) {
  const devServerConfigFilepath = resolvePath(process.cwd(), relativeDevServerConfigFilepath);

  const {filepath$, relativePathByMatch$} = getMatchResult(srcPatternList);

  const xf = comp(...[
    map(chunkList$ToStaticMarkup$),
    map(staticMarkup$ => {
      return staticMarkup$
        .combineLatest(relativePathByMatch$,
          ({filepath, markup}, relativePathByMatch) => {
            const relativePath = relativePathByMatch[filepath];

            return {
              filepath: resolvePath(destDir, relativePath),
              markup,
            };
          }
        )
        .selectMany(({filepath, markup}) => {
          return writeFile(filepath, markup);
        });
    }),
  ]);

  Observable.of(filepath$)
    .transduce(xfFilepath$ToWebpackConfig$)
    .selectMany(webpackConfig$ => {
      // Why selectMany? Because devServer is watching and could be repeative.
      // Instead of wrapping one value, now a series of values are emitted.
      const devServerConfig$ = webpackConfig$
        .filter(({webpackConfigFilepath}) => webpackConfigFilepath === devServerConfigFilepath)
        .map(({webpackConfig: {devServer}}) => devServer)
        .first();

      return Observable.combineLatest(
          webpackConfig$,
          devServerConfig$,
          (it, {host, port}) => {
            const {webpackConfig} = it;
            const inlineDevServerChunkList = [
              require.resolve("webpack-dev-server/client/") + `?http://${ host }:${ port }`,
              "webpack/hot/dev-server",
            ];

            return {
              ...it,
              webpackConfig: {
                ...webpackConfig,
                entry: _.mapValues(webpackConfig.entry, filepathList =>
                  inlineDevServerChunkList.concat(filepathList)
                ),
                plugins: [
                  ...webpackConfig.plugins,
                  new webpack.HotModuleReplacementPlugin(),
                ],
              },
            };
          }
        )
        .map(it => Observable.of(it))
        .map(webpackConfig$ToWebpackCompiler$)
        .combineLatest(
          webpackConfig$.count(),
          (webpackCompiler$, count) => ({webpackCompiler$, count})
        )
        .selectMany(({webpackCompiler$, count}) => {
          return Observable.of(webpackCompiler$)
            .map(webpackCompiler$ => {
              return Observable.combineLatest(
                devServerConfig$,
                webpackCompiler$,
                (devServerConfig, webpackCompiler) => {
                  const wDS = new WebpackDevServer(webpackCompiler, devServerConfig);

                  return Observable.create(observer => {
                    wDS.listen(devServerConfig.port, devServerConfig.host, (err) => {
                      if (err) {
                        observer.onError(err);
                      }
                    });

                    webpackCompiler.plugin("done", stats => {
                      observer.onNext(Observable.fromArray(stats.toJson().children));
                    });
                  });
                }
              ) 
                .selectMany(identity);
            })
            .selectMany(identity);
        })
        .map(mergeWebpackStats$ToChunkList$WithWebpackConfig$(webpackConfig$))
    })
    .transduce(xf)
    .concatAll()
    .subscribe(
      ::console.log,
      ::console.error,
      () => { console.log("done!"); }
    );
}

/**
 * @private
 */
export function getMatchResult (srcPatternList) {
  const matchResult$ = Observable.fromArray(srcPatternList)
    .selectMany(srcPatternToMatchResult)
    .reduce(matchResultToMatchesFilepathReducer, {matches: [], relativePathByMatch: {}})
    .first();

  const filepath$ = matchResult$
    .selectMany(({matches}) => Observable.fromArray(matches));

  const relativePathByMatch$ = matchResult$
    .map(({relativePathByMatch}) => relativePathByMatch);

  return {
    filepath$,
    relativePathByMatch$,
  };
}

/**
 * @private
 */
export function srcPatternToMatchResult (srcPattern) {
  const globber = new Glob(srcPattern);
  const base = glob2base(globber);

  return Rx.Observable.create(function (observer) {
    function callback (matches) {
      observer.onNext({
        base,
        matches,
      });
      observer.onCompleted();
    };

    globber.once("end", callback);

    return globber.removeListener.bind(globber, "end", callback);
  });
}

/**
 * @private
 */
export function matchResultToMatchesFilepathReducer (acc, {base, matches}) {
  acc.matches.push(...matches);
  matches.forEach(match => {

    const filepath = replaceWithHtmlExt(match);
    acc.relativePathByMatch[match] = relativePathOf(base, filepath);
  });

  return acc;
}

/**
 * @private
 */
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

/**
 * @private
 */
export function watchMultiCompiler$ToChildrenStats$ (webpackCompiler$) {
  // return Observable.create(observer => {
  //   function callback (err, stats) {
  //     if (err) {
  //       observer.onError(err);
  //     } else {
  //       observer.onNext(stats);
  //     }
  //   }
  //   const watcher = webpackCompiler.watch({}, callback);
  //   return watcher.close.bind(watcher);
  // });
  // We cannot use the above code because we want every results in a sub compiler.
  // This is an issue of implementation details of webpack
  return webpackCompiler$
    .selectMany(webpackCompiler => Observable.fromArray(webpackCompiler.compilers))
    .selectMany((compiler, index) => {

      return Observable.create(observer => {
        function callback (err, stats) {
          if (err) {
            observer.onError(err);
          } else {
            observer.onNext({
              index,
              statsJson: stats.toJson(),
            });
          }
        }

        const watcher = compiler.watch({}, callback);

        return watcher.close.bind(watcher);
      });
    });
}
