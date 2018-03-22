import { Component } from 'react'; // eslint-disable-line import/no-extraneous-dependencies
import { bool, func, number, string } from 'prop-types'; // eslint-disable-line import/no-extraneous-dependencies
import { WebAuth } from 'auth0-js';
import { CHANNEL } from '../../util';

export default class Authorize extends Component {
  /* eslint-disable react/no-unused-prop-types, react/require-default-props */
  static propTypes = {
    render: func.isRequired,
    domain: string.isRequired,
    clientID: string.isRequired,
    authorize: bool,
    popup: bool,
    audience: string,
    connection: string,
    scope: string,
    responseMode: string,
    responseType: string,
    redirectUri: string,
    state: string,
    leeway: number,
    disableDeprecationWarnings: bool,
  };
  /* eslint-enable react/no-unused-prop-types */

  static defaultProps = {
    authorize: false,
    popup: false,
  };

  static get AUTHORIZATION_DONE() {
    return !!localStorage.getItem(CHANNEL);
  }

  state = {
    error: null,
    authResult: null,
    userInfo: null,
  };

  auth = this.getAuthClient(this.props);

  componentDidMount() {
    this.authCheck(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.auth = this.getAuthClient(nextProps);
    this.authCheck(nextProps);
  }

  authCheck(props) {
    if (props.authorize) {
      this.authorize(props);
    } else {
      localStorage.removeItem(CHANNEL);

      if (props.authorize !== this.props.authorize) {
        this.setState({ error: null, authResult: null, userInfo: null });
      }
    }
  }

  getAuthClient(props) {
    return new WebAuth({
      domain: props.domain,
      clientID: props.clientID,
      redirectUri: props.redirectUri,
      scope: props.scope,
      audience: props.audience,
      responseType: props.responseType,
      responseMode: props.responseMode,
      leeway: props.leeway,
      _disableDeprecationWarnings: props.disableDeprecationWarnings,
    });
  }

  parse() {
    return new Promise((resolve, reject) => {
      this.auth.parseHash(
        { hash: localStorage.getItem(CHANNEL) },
        (error, authResult) => {
          localStorage.removeItem(CHANNEL);

          if (error) {
            reject(error);
          } else if (!authResult) {
            reject(new Error('No authorization result'));
          } else {
            resolve(authResult);
          }
        }
      );
    });
  }

  userInfo(accessToken) {
    return new Promise((resolve, reject) => {
      this.auth.client.userInfo(accessToken, (error, userInfo) => {
        if (error) {
          reject(error);
        } else if (!userInfo) {
          reject(new Error('No user info'));
        } else {
          resolve(userInfo);
        }
      });
    });
  }

  async login() {
    try {
      const authResult = await this.parse();
      const userInfo = await this.userInfo(authResult.accessToken);

      this.setState({
        error: null,
        authResult,
        userInfo,
      });
    } catch (error) {
      this.setState({
        error,
        authResult: null,
        userInfo: null,
      });
    }
  }

  authorize(props) {
    if (Authorize.AUTHORIZATION_DONE) {
      this.login();

      return;
    }

    const options = {
      audience: props.audience,
      connection: props.connection,
      scope: props.scope,
      responseType: props.responseType,
      clientID: props.clientID,
      redirectUri: props.redirectUri,
      state: props.state,
    };

    if (props.popup) {
      window.addEventListener(
        'storage',
        function handler({ storageArea, key }) {
          if (storageArea !== localStorage || key !== CHANNEL) {
            return;
          }

          window.removeEventListener('storage', handler);
          this.login();
        }.bind(this)
      );
      this.auth.popup.authorize(options, Function.prototype);
    } else {
      this.auth.authorize(options);
    }
  }

  render() {
    const { render } = this.props;

    return render({ ...this.state });
  }
}
