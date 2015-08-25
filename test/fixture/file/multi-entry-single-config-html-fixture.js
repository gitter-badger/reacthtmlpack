import {
  default as React,
} from "react";

import {
  default as TestEntry,
} from "../component/TestEntry";

export default (
  <html>
    <head>
      <title>html-fixture</title>
      <TestEntry
        chunkName="chunkName-fixture"
        chunkFilepath="chunkFilepath-fixture.js"
        configFilepath="configFilepath-fixture.config.js"
      />
    </head>
    <TestEntry
        chunkName="chunkName-2-fixture"
        chunkFilepath="chunkFilepath-2-fixture.js"
        configFilepath="configFilepath-fixture.config.js"
      />
  </html>
);
