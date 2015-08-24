import {
  default as chai,
} from "chai";

import {
  default as dirtyChai,
} from "dirty-chai";

import {
  filepath$ToBabelResult$,
} from "../src/core";

chai.use(dirtyChai);
chai.should();

describe("core", () => {

  describe("filepath$ToBabelResult$", () => {

    it("should be exported", () => {
      filepath$ToBabelResult$.should.exist();
    });

    xit("should transform a filepath stream into babel-result stream", () => {
    });
  });
});
