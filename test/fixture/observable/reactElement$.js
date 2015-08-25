import {
  resolve as resolvePath,
} from "path";

import {
  default as Rx,
  Observable,
} from "rx";

export default Observable.from([
  {
    filepath: resolvePath(__dirname, "../file/html-fixture.js"),
    element: require("../file/html-fixture.js"),
  },
]);

export const multiEntrySingleConfig$ = Observable.from([
  {
    filepath: resolvePath(__dirname, "../file/multi-entry-single-config-html-fixture.js"),
    element: require("../file/multi-entry-single-config-html-fixture.js"),
  },
]);
