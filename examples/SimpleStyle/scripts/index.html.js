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
        entryName="assets/vendorStyle"
        entryFilepath="normalize.css"
        configFilepath="../SimpleStyle.webpackConfig.js"
      />
      <WebpackStyleEntry
        entryName="assets/style"
        entryFilepath="./index.css"
        configFilepath="../SimpleStyle.webpackConfig.js"
      />
      <script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing" />
    </head>
    <body>
      <div id="react-container" />
      <WebpackScriptEntry
        entryName="assets/script"
        entryFilepath="./scripts/client.js"
        configFilepath="../SimpleStyle.webpackConfig.js"
      />
    </body>
  </html>
);
