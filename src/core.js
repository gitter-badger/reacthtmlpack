import {
  dirname as toDirname,
  resolve as resolvePath,
} from "path";

import {
  default as Rx,
  Subject,
  Observable,
} from "rx";

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

// export default const core = new Subject();

export function turnCommandInto (filepathList) {
  const filepathObs = Observable.from(filepathList);

  const webpackConfigObs = filepathObs
    .zip(
      filepathObs.selectMany(filepath => transformFile(filepath)),
      (filepath, result) => ({filepath, ...result})
    )
    .map(fromBabelCodeToReactElement)
    .selectMany(extractWebpackConfigFilepathList)
    .groupBy(it => it.webpackConfigFilepath)
    .selectMany(groupedObsToWebpackConfig);

  return webpackConfigObs
    .reduce((acc, {webpackConfig}) => acc.concat(webpackConfig), [])
    .first()
    .selectMany(runWebpackCompiler)
    .map(stats => stats.toJson())
    .zip(webpackConfigObs, (statsJson, {chunkList}) => ({chunkList, statsJson}))
    .selectMany(chunkListWithStats)
    .groupBy(it => it.filepath)
    .selectMany(groupedObsToStaticMarkup);
}

export function fromBabelCodeToReactElement ({filepath, code}) {
  const ComponentModule = evaluateAsModule(code, filepath);
  const element = ComponentModule.exports;

  return {
    filepath,
    element,
  };
}

function isEntryType (type) {
  return entryPropTypeKeyList.every(key => {
    return type.propTypes && type.propTypes[key];
  });
}

function entryWithConfigReducer (children) {
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

export function extractWebpackConfigFilepathList ({filepath, element}) {
  const entryWithConfigList = entryWithConfigReducer(element.props.children);

  return Observable.from(entryWithConfigList)
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

function toEntryReducer(acc, item) {
  const {chunkName, chunkFilepath} = item;
  acc.entry[chunkName] = chunkFilepath;
  acc.chunkList.push(item);
  return acc;
}

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

export function runWebpackCompiler (webpackConfig) {
  const compiler = webpack(webpackConfig);

  // return Observable.fromNodeCallback(::compiler.run)();

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) {
        reject(err);
      } else {
        resolve(stats);
      }
    });
  });
}

export function chunkListWithStats ({chunkList, statsJson}) {
  return Observable.combineLatest(
    Observable.from(chunkList),
    Observable.from(statsJson.children),
    (it, statsJson) => ({statsJson, ...it})
  );
}

function entryWithOutputMapper (children, outputFilepathByEntryName) {
  return Children.map(children, child => {
    if (!React.isValidElement(child)) {
      return child;
    }
    const {
      chunkName,
      children,
    } = child.props;

    const extraProps = {
      children: entryWithOutputMapper(children, outputFilepathByEntryName),
    };

    if (isEntryType(child.type)) {
      const outputFilepathOrList = outputFilepathByEntryName[chunkName];
      extraProps.outputFilepathList = [].concat(outputFilepathOrList);
    }

    return React.cloneElement(child, extraProps);
  });
}

export function groupedObsToStaticMarkup (groupedObservable) {
  // http://requirebin.com/?gist=fe2c7d8fe7083d8bcd2d
  return groupedObservable.reduce((acc, item) => {
    const {chunkName, statsJson} = item;

    acc.outputFilepathByEntryName[chunkName] = statsJson.assetsByChunkName[chunkName];
    acc.filepath = item.filepath;
    acc.element = item.element;

    return acc;
  }, {outputFilepathByEntryName: {}})
    .first()
    .map(({outputFilepathByEntryName, filepath, element}) => {
      const clonedElement = React.cloneElement(element, {
        children: entryWithOutputMapper(element.props.children, outputFilepathByEntryName),
      });

      const markup = React.renderToStaticMarkup(clonedElement);

      return {
        filepath,
        markup,
      };
    });
}

