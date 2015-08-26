import {
  default as React,
  Component,
  PropTypes,
} from "react";

export default class WebpackStyleEntry extends Component {
  static propTypes = {
    chunkName: PropTypes.string.isRequired,
    chunkFilepath: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string),
    ]).isRequired,
    configFilepath: PropTypes.string.isRequired,
    // Generated later.
    outputAssetList: PropTypes.arrayOf(PropTypes.shape({
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
        .filter(::/\.css$/.test);

      return (
        <link {...restProps} href={outputPublicFilepath} />
      );
    } else {
      return (
        <noscript />
      );
    }
  }
}
