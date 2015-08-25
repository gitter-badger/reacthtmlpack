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
  babelResult$ToReactElement$
} from "../src/core";

import {
  filepath$Fixture,
  babelResult$Fixture,
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

          filepath.should.equals(es6Filepath);
          code.should.equals(es5Fixture);

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

          filepath.should.equals(es6Filepath);
          element.abc.should.be.a("function");
          element.resolvePath.should.equals(resolvePath);

        }, done, () => {
          callback.calledOnce.should.be.true();

          done();
        });
    });

  });
});
