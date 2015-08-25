import {
  resolve as resolvePath,
} from "path";

import {
  default as Rx,
  Observable,
} from "rx";

export default Observable.from([
  {
    filepath: resolvePath(__dirname, "../html/single-entry-single-config-fixture.html.js"),
    element: require("../html/single-entry-single-config-fixture.html.js"),
  },
]);

export const multiEntrySingleConfig$ = Observable.from([
  {
    filepath: resolvePath(__dirname, "../html/multi-entry-single-config-fixture.html.js"),
    element: require("../html/multi-entry-single-config-fixture.html.js"),
  },
]);
