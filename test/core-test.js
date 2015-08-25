import {
  resolve as resolvePath,
} from "path";

import {
  default as sinon,
} from "sinon";

import {
  default as chai,
} from "chai";

import {
  default as dirtyChai,
} from "dirty-chai";

import {
  default as Rx,
  Observable,
} from "rx";

import {
  filepath$ToBabelResult$,
  babelResult$ToReactElement$,
  reactElement$ToChunkList$,
} from "../src/core";

import {
  filepath$Fixture,
  babelResult$Fixture,
  reactElement$Fixture,
} from "./fixture/observable";

import {
  readFileAsContent,
} from "./util";

chai.use(dirtyChai);
chai.should();

describe("core", () => {

  describe("filepath$ToBabelResult$", () => {

    it("should be exported", () => {
      filepath$ToBabelResult$.should.exist();
    });

    it("should transform a filepath stream into a babel-result stream", (done) => {
      const callback = sinon.spy();
      
      filepath$ToBabelResult$(filepath$Fixture)
        .tapOnNext(callback)
        .subscribe(({filepath, code}) => {

          const es6Filepath = resolvePath(__dirname, "./fixture/file/es6-fixture.js");
          const es5Fixture = readFileAsContent(resolvePath(__dirname, "./fixture/file/es5-fixture.js"));

          filepath.should.equal(es6Filepath);
          code.should.equal(es5Fixture);

        }, done, () => {
          callback.calledOnce.should.be.true();

          done();
        });
    });

  });

  describe("babelResult$ToReactElement$", () => {

    it("should be exported", () => {
      babelResult$ToReactElement$.should.exist();
    });

    it("should transform a babel-result stream into a ReactElement stream", (done) => {
      const callback = sinon.spy();
      
      babelResult$ToReactElement$(babelResult$Fixture)
        .tapOnNext(callback)
        .subscribe(({filepath, element}) => {

          const es6Filepath = resolvePath(__dirname, "./fixture/file/es6-fixture.js");

          filepath.should.equal(es6Filepath);
          element.abc.should.be.a("function");
          element.resolvePath.should.equal(resolvePath);

        }, done, () => {
          callback.calledOnce.should.be.true();

          done();
        });
    });

  });

  describe("reactElement$ToChunkList$", () => {

    it("should be exported", () => {
      reactElement$ToChunkList$.should.exist();
    });

    it("should transform a ReactElement stream into a chunk stream", (done) => {
      const callback = sinon.spy();
      
      reactElement$ToChunkList$(reactElement$Fixture)
        .tapOnNext(callback)
        .subscribe(({filepath, element, chunkName, chunkFilepath, webpackConfigFilepath}) => {

          const expectedHtmlFilepath = resolvePath(__dirname, "./fixture/file/html-fixture.js");
          const expectedWebpackConfigFilepath = resolvePath(__dirname, "./fixture/file/configFilepath-fixture.config.js");

          filepath.should.equal(expectedHtmlFilepath);

          element.type.should.equal("html");
          const head = element.props.children;
          const title = head.props.children[0];
          const entry = head.props.children[1];

          head.type.should.equal("head");
          title.type.should.equal("title");

          entry.type.name.should.equal("TestEntry");
          entry.props.should.eql({
            chunkName: "chunkName-fixture",
            chunkFilepath: "chunkFilepath-fixture.js",
            configFilepath: "configFilepath-fixture.config.js",
          });

          chunkName.should.equal("chunkName-fixture");
          chunkFilepath.should.equal("chunkFilepath-fixture.js");
          webpackConfigFilepath.should.equal(expectedWebpackConfigFilepath);

        }, done, () => {
          callback.calledOnce.should.be.true();

          done();
        });
    });

  });
});
