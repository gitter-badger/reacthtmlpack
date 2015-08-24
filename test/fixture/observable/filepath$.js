import {
  resolve as resolvePath,
} from "path";

import {
  default as Rx,
  Observable,
} from "rx";

export default Observable.from([
  resolvePath(__dirname, "../file/es6-fixture.js"),
]);