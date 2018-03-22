import { Component } from 'react'; // eslint-disable-line import/no-extraneous-dependencies
import { func } from 'prop-types'; // eslint-disable-line import/no-extraneous-dependencies
import { CHANNEL } from '../../util';

export default class Callback extends Component {
  static propTypes = {
    onReady: func,
  };

  static defaultProps = {
    onReady: null,
  };

  async componentDidMount() {
    if (window !== window.top) {
      window.parent.postMessage(window.location.hash, window.origin);

      return;
    }

    localStorage.setItem(CHANNEL, window.location.hash);

    if (this.props.onReady) {
      await this.props.onReady();
    }

    if (window.opener) {
      window.close();
    }
  }

  render() {
    return null;
  }
}
