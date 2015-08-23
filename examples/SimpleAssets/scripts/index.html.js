import {
  default as React,
} from "react";

import {
  WebpackScriptEntry,
  WebpackStyleEntry,
} from "../../../lib/entry";

export default (
  <html>
    <head>
      <title>React Google Maps | tomchentw</title>
      <WebpackStyleEntry
        entryName="assets/client"
        entryFilepath="./scripts/client.js"
        configFilepath="../SimpleAssets.webpackConfig.js"
      />
      <script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing" />
    </head>
    <body>
      <div id="react-container" />
      <WebpackScriptEntry
        entryName="assets/client"
        entryFilepath="./scripts/client.js"
        configFilepath="../SimpleAssets.webpackConfig.js"
      />
    </body>
  </html>
);
