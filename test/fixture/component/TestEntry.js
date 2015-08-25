import {
  default as React,
  Component,
  PropTypes,
} from "react";

export default class TestEntry extends Component {
  static propTypes = {
    chunkName: PropTypes.string.isRequired,
    chunkFilepath: PropTypes.string.isRequired,
    configFilepath: PropTypes.string.isRequired,
  }

  render () {
    return null
  }
}
