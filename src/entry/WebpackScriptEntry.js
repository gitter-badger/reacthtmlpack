import {
  default as React,
  Component,
  PropTypes,
} from "react";

export default class WebpackScriptEntry extends Component {
  static propTypes = {
    entryName: PropTypes.string,
    entryFilepath: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string),
    ]).isRequired,
    configFilepath: PropTypes.string.isRequired,
    // Generated later.
    outputFilepath: PropTypes.string,
  }

  render () {
    const {
      entryName,
      entryFilepath,
      configFilepath,
      outputFilepath,
      ...restProps
    } = this.props;

    if (outputFilepath) {
      return (
        <script {...restProps} src={outputFilepath} />
      );
    } else {
      return (
        <noscript />
      );
    }
  }
}
