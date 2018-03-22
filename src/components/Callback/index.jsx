import { Component } from 'react'; // eslint-disable-line import/no-extraneous-dependencies
import { func } from 'prop-types'; // eslint-disable-line import/no-extraneous-dependencies
import { CHANNEL } from '../../util';

/**
 * A component that responds to an Auth0 authorization flow.
 * This component should be rendered in the callback page that Auth0
 * redirects to. When using the popup flow, the component will automatically
 * close the popup, otherwise you can handle next steps using `onReady`,
 * typically by redirecting back to the page that contained the Authorization
 * component.
 */
export default class Callback extends Component {
  static propTypes = {
    /**
     * Execute a function once the component renders. Typically used
     * to redirect to the Authorization component page after the login flow.
     */
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
