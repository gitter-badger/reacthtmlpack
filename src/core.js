import {
  dirname as toDirname,
  resolve as resolvePath,
} from "path";

import {
  default as Rx,
  Subject,
  Observable,
} from "rx";

import {
  comp,
  map,
  filter,
  identity,
} from "transducers-js";

Rx.config.longStackSupport = true;

// Note babel-core/index.js is NOT a ES6 module
const babel = require("babel-core");

import {
  default as evaluateAsModule,
} from "eval-as-module";

import {
  default as React,
  Children,
} from "react";

import {
  default as webpack,
} from "webpack";

import {
  default as entryPropTypeKeyList,
} from "./entry/entryPropTypeKeyList";

const transformFile = Observable.fromNodeCallback(babel.transformFile);

export const xfFilepath$ToWebpackConfig$ = comp(...[
  map(filepath$ToBabelResult$),
  map(babelResult$ToReactElement$),
  map(reactElement$ToChunkList$),
  map(chunkList$ToWebpackConfig$),
]);

/**
 * @public
 */
export function filepath$ToBabelResult$ (filepath$) {
  return filepath$
    .selectMany(filepath => {
      return transformFile(filepath)
        .map(({code}) => ({filepath, code}));
    });
}

/**
 * @public
 */
export function babelResult$ToReactElement$ (babelResult$) {
  return babelResult$
    .map(fromBabelCodeToReactElement);
}

/**
 * @public
 */
export function reactElement$ToChunkList$ (reactElement$) {
  return reactElement$
    .selectMany(extractWebpackConfigFilepathList);
}

/**
 * @public
 */
export function chunkList$ToWebpackConfig$ (chunkList$) {
  return chunkList$
    .groupBy(it => it.webpackConfigFilepath)
    .selectMany(groupedObsToWebpackConfig);
}

/**
 * @package
 */
export function webpackConfig$ToWebpackCompiler$ (webpackConfig$) {
  return webpackConfig$
    .reduce((acc, {webpackConfig}) => acc.concat(webpackConfig), [])
    .first()
    // The webpackCompiler should be an instance of MultiCompiler
    .map(webpackConfig => webpack(webpackConfig));
}

/**
 * @package
 */
export function webpackCompiler$ToWebpackStats$ (webpackCompiler$) {
  return webpackCompiler$
    .selectMany(runWebpackCompiler)
    .selectMany(stats =>
      // See MultiCompiler - MultiStats
      Observable.fromArray(stats.stats)
        .map(stats => ({stats, statsJson: stats.toJson()}))
    );
}

/**
 * @public
 */
export function webpackConfig$ToChunkList$ (webpackConfig$) {
  return Observable.of(webpackConfig$)
    .map(webpackConfig$ToWebpackCompiler$)
    .map(webpackCompiler$ToWebpackStats$)
    .selectMany(mergeWebpackStats$ToChunkList$WithWebpackConfig$(webpackConfig$));
}

/**
 * @public
 */
export function chunkList$ToStaticMarkup$ (chunkList$) {
  return chunkList$
    .groupBy(it => it.webpackConfigFilepath)
    .selectMany(groupedObsToStaticMarkup);
}

/**
 * @private
 */
export function fromBabelCodeToReactElement ({filepath, code}) {
  const ComponentModule = evaluateAsModule(code, filepath);
  const element = ComponentModule.exports;

  return {
    filepath,
    element,
  };
}

/**
 * @private
 */
export function isEntryType (type) {
  return entryPropTypeKeyList.every(key => {
    return type.propTypes && type.propTypes[key];
  });
}

/**
 * @private
 */
export function entryWithConfigReducer (children) {
  const acc = [];

  Children.forEach(children, child => {
    if (!React.isValidElement(child)) {
      return;
    }
    if (isEntryType(child.type)) {
      const {
        chunkName,
        chunkFilepath,
        configFilepath,
      } = child.props;

      acc.push({
        chunkName,
        chunkFilepath,
        configFilepath,
      });
    }
    acc.push(...entryWithConfigReducer(child.props.children));
  });

  return acc;
}

/**
 * @private
 */
export function extractWebpackConfigFilepathList ({filepath, element}) {
  const entryWithConfigList = entryWithConfigReducer(element.props.children);

  return Observable.fromArray(entryWithConfigList)
    .map(({chunkName, chunkFilepath, configFilepath}) => {
      return {
        filepath,
        element,
        chunkName,
        chunkFilepath,
        webpackConfigFilepath: resolvePath(toDirname(filepath), configFilepath),
      };
    });
}

/**
 * @private
 */
export function toEntryReducer(acc, item) {
  const {chunkName, chunkFilepath} = item;
  acc.entry[chunkName] = chunkFilepath;
  acc.chunkList.push(item);
  return acc;
}

/**
 * @private
 */
export function groupedObsToWebpackConfig (groupedObservable) {
  // http://requirebin.com/?gist=fe2c7d8fe7083d8bcd2d
  const {key: webpackConfigFilepath} = groupedObservable;

  return groupedObservable.reduce(toEntryReducer, {entry: {}, chunkList: []})
    .first()
    .map(function ({entry, chunkList}) {
      return {
        webpackConfigFilepath,
        chunkList,
        webpackConfig: {
          ...require(webpackConfigFilepath),
          entry,
        },
      };
    });
}

/**
 * @private
 */
export function runWebpackCompiler (compiler) {
  return Observable.fromNodeCallback(::compiler.run)();
}

/**
 * @package
 */
export function mergeWebpackStats$ToChunkList$WithWebpackConfig$ (webpackConfig$) {
  return webpackStats$ => {
    return Observable.zip(
      webpackStats$,
      webpackConfig$,
      ({stats, statsJson}, {chunkList}) => ({chunkList, stats, statsJson})
    )
    .selectMany(chunkListWithStats);
  };
}

/**
 * @private
 */
export function chunkListWithStats ({chunkList, stats, statsJson}) {
  return Observable.fromArray(chunkList)
    .map((it) => {
      const outputAssetList = [].concat(statsJson.assetsByChunkName[it.chunkName])
        .map(assetName => {
          return {
            rawAsset: stats.compilation.assets[assetName],
            publicFilepath: `${ statsJson.publicPath }${ assetName }`,
          };
        });

      return {
        ...it,
        outputAssetList,
      };
    });
}

/**
 * @private
 */
export function entryWithOutputMapper (children, outputAssetListByChunkName) {
  return Children.map(children, child => {
    if (!React.isValidElement(child)) {
      return child;
    }
    const {
      chunkName,
      children,
    } = child.props;

    const extraProps = {
      children: entryWithOutputMapper(children, outputAssetListByChunkName),
    };

    if (isEntryType(child.type)) {
      extraProps.outputAssetList = outputAssetListByChunkName[chunkName];
    }

    return React.cloneElement(child, extraProps);
  });
}

/**
 * @private
 */
export function groupedObsToStaticMarkup (groupedObservable) {
  // http://requirebin.com/?gist=fe2c7d8fe7083d8bcd2d
  return groupedObservable.reduce((acc, item) => {
    const {chunkName, outputAssetList} = item;


    acc.outputAssetListByChunkName[chunkName] = outputAssetList;
    acc.filepath = item.filepath;
    acc.element = item.element;

    return acc;
  }, {outputAssetListByChunkName: {}})
    .first()
    .map(({outputAssetListByChunkName, filepath, element}) => {
      const clonedElement = React.cloneElement(element, {
        children: entryWithOutputMapper(element.props.children, outputAssetListByChunkName),
      });

      const markup = React.renderToStaticMarkup(clonedElement);

      return {
        filepath,
        markup,
      };
    });
}

