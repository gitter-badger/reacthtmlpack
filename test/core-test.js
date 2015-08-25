import {
  default as fs,
} from "fs";

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
} from "../src/core";

import {
  filepath$Fixture,
} from "./fixture/observable";

chai.use(dirtyChai);
chai.should();

describe("core", () => {

  describe("filepath$ToBabelResult$", () => {

    it("should be exported", () => {
      filepath$ToBabelResult$.should.exist();
    });

    it("should transform a filepath stream into babel-result stream", (done) => {
      const callback = sinon.spy();
      
      filepath$ToBabelResult$(filepath$Fixture)
        .tapOnNext(callback)
        .subscribe(({filepath, code}) => {

          const es6Filepath = resolvePath(__dirname, "./fixture/file/es6-fixture.js");
          const es5Fixture = fs.readFileSync(resolvePath(__dirname, "./fixture/file/es5-fixture.js"), "utf8").trim();

          filepath.should.equals(es6Filepath);
          code.should.equals(es5Fixture);

        }, done, () => {
          callback.calledOnce.should.be.true();

          done();
        });
    });
  });
});
