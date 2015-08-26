import {
  default as React,
  Component,
  PropTypes,
} from "react";

export default class WebpackScriptEntry extends Component {
  static propTypes = {
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
      chunkName,
      chunkFilepath,
      configFilepath,
      outputAssetList,
      ...restProps,
    } = this.props;

    if (outputAssetList) {
      const [outputPublicFilepath] = outputAssetList
        .map(({publicFilepath}) => publicFilepath)
        .filter(::/\.js$/.test);

      return (
        <script {...restProps} src={outputPublicFilepath} />
      );
    } else {
      return (
        <noscript />
      );
    }
  }
}
