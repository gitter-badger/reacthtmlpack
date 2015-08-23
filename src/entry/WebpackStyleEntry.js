import {
  default as React,
  Component,
  PropTypes,
} from "react";

export default class WebpackStyleEntry extends Component {
  static propTypes = {
    chunkName: PropTypes.string,
    chunkFilepath: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string),
    ]).isRequired,
    configFilepath: PropTypes.string.isRequired,
    // Generated later.
    outputFilepathList: PropTypes.arrayOf(PropTypes.string),
  }

  render () {
    const {
      chunkName,
      chunkFilepath,
      configFilepath,
      outputFilepathList,
      ...restProps,
    } = this.props;

    if (outputFilepathList) {
      const [outputFilepath] = outputFilepathList.filter(::/\.css$/.test);

      return (
        <link {...restProps} href={outputFilepath} />
      );
    } else {
      return (
        <noscript />
      );
    }
  }
}
