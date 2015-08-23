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

import * as Entries from "./entry";

const transformFile = Observable.fromNodeCallback(babel.transformFile);

// export default const runFiles = new Subject();

export function turnCommandInto (filepathList) {
  const filepathObs = Observable.from(filepathList);

  const webpackConfigObs = filepathObs
    .zip(
      filepathObs.flatMap(filepath => transformFile(filepath)),
      (filepath, result) => ({filepath, ...result})
    )
    .map(fromBabelCodeToReactElement)
    .flatMap(extractWebpackConfigFilepathList)
    .groupBy(it => it.webpackConfigFilepath)
    .flatMap(groupedObsToWebpackConfig);

  const webpackStatsObs = webpackConfigObs
    .reduce((acc, {webpackConfig}) => acc.concat(webpackConfig), [])
    .first()
    .flatMap(runWebpackCompiler)
    .map(stats => stats.toJson());

  return webpackConfigObs
    .zip(
      webpackStatsObs,
      ({entryList}, statsJson) => ({entryList, statsJson})
    )
    .flatMap(entryListWithStats)
    .groupBy(it => it.filepath)
    .flatMap(groupedObsToStaticMarkup);
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
  return Object.keys(Entries).some(function (it) {
    const EntryClass = Entries[it];

    return type === EntryClass;
  })
}

function entryWithConfigReducer (children) {
  const acc = [];

  Children.forEach(children, child => {
    if (!React.isValidElement(child)) {
      return;
    }
    if (isEntryType(child.type)) {
      const {
        entryName,
        entryFilepath,
        configFilepath,
      } = child.props;

      acc.push({
        entryName,
        entryFilepath,
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
    .map(({entryName, entryFilepath, configFilepath}) => {
      return {
        filepath,
        element,
        entryName,
        entryFilepath,
        webpackConfigFilepath: resolvePath(toDirname(filepath), configFilepath),
      };
    });
}

function toEntryReducer(acc, item) {
  const {entryName, entryFilepath} = item;
  acc.entry[entryName] = entryFilepath;
  acc.list.push(item);
  return acc;
}

export function groupedObsToWebpackConfig (groupedObservable) {
  // http://requirebin.com/?gist=fe2c7d8fe7083d8bcd2d
  const {key: webpackConfigFilepath} = groupedObservable;

  return groupedObservable.reduce(toEntryReducer, {entry: {}, list: []})
    .first()
    .map(function ({entry, list}) {
      return {
        webpackConfigFilepath,
        entryList: list,
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

export function entryListWithStats ({entryList, statsJson}) {
  return Observable.zip(
    Observable.from(entryList),
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
      entryName,
      children,
    } = child.props;

    const extraProps = {
      children: entryWithOutputMapper(children, outputFilepathByEntryName),
    };

    if (isEntryType(child.type)) {
      extraProps.outputFilepath = outputFilepathByEntryName[entryName];
    }

    return React.cloneElement(child, extraProps);
  });
}

export function groupedObsToStaticMarkup (groupedObservable) {
  // http://requirebin.com/?gist=fe2c7d8fe7083d8bcd2d
  return groupedObservable.reduce((acc, item) => {
    const {entryName, statsJson} = item;

    acc.outputFilepathByEntryName[entryName] = statsJson.assetsByChunkName[entryName];
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

