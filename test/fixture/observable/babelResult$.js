import {
  resolve as resolvePath,
} from "path";

import {
  default as Rx,
  Observable,
} from "rx";

import {
  readFileAsContent,
} from "../../util";

export default Observable.from([
  {
    filepath: resolvePath(__dirname, "../file/es6-fixture.js"),
    code: readFileAsContent(resolvePath(__dirname, "../file/es5-fixture.js")),
  },
]);
