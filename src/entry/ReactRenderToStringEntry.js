import {
  default as React,
  Component,
  PropTypes,
} from "react";

import {
  evaluateAsES2015Module,
} from "../core";

export default class ReactRenderToStringEntry extends Component {
  static propTypes = {
    tagName: PropTypes.string.isRequired,
    chunkName: PropTypes.string.isRequired,
    chunkFilepath: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string),
    ]).isRequired,
    configFilepath: PropTypes.string.isRequired,
    // Generated later.
    outputAssetList: PropTypes.arrayOf(PropTypes.shape({
      rawAsset: PropTypes.object.isRequired,
      publicFilepath: PropTypes.string.isRequired,
    })),
  }

  render () {
    const {
      tagName,
      chunkName,
      chunkFilepath,
      configFilepath,
      outputAssetList,
      ...restProps,
    } = this.props;

    if (outputAssetList) {
      const [{rawAsset}] = outputAssetList
        .filter(({publicFilepath}) => /\.js$/.test(publicFilepath));

      const ComponentModule = evaluateAsES2015Module(rawAsset.source());

      const markup = {
        __html: React.renderToString(<ComponentModule.default />),
      };

      return React.createElement(tagName, {
        ...restProps,
        dangerouslySetInnerHTML: markup,
      });
    } else {
      return (
        <noscript />
      );
    }
  }
}
