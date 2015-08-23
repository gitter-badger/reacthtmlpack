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
        chunkName="assets/vendorStyle"
        chunkFilepath="normalize.css"
        configFilepath="../SimpleStyle.webpackConfig.js"
      />
      <WebpackStyleEntry
        chunkName="assets/style"
        chunkFilepath="./index.css"
        configFilepath="../SimpleStyle.webpackConfig.js"
      />
      <script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing" />
    </head>
    <body>
      <div id="react-container" />
      <WebpackScriptEntry
        chunkName="assets/script"
        chunkFilepath="./scripts/client.js"
        configFilepath="../SimpleStyle.webpackConfig.js"
      />
    </body>
  </html>
);
