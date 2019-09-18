import { Component } from 'react'; // eslint-disable-line import/no-extraneous-dependencies
import { bool, func, number, string } from 'prop-types'; // eslint-disable-line import/no-extraneous-dependencies
import { WebAuth } from 'auth0-js';
import { CHANNEL, SESSION } from '../../util';

/**
 * A component which starts an Auth0 authorization flow,
 * and renders a function based on the flow, such as user
 * information and authorization results.
 */
export default class Authorize extends Component {
  /* eslint-disable react/no-unused-prop-types, react/require-default-props */
  static propTypes = {
    /**
     * A function which will be rendered based on the results of an Auth0
     * authorization flow. Will receive an object with 3 properties:
     *   `error`: Auth0 error, or error if the Auth0 flow did not return an
     *     expected `userInfo` or `authResult`
     *   `userInfo`: Correlates to the information returned by the `userInfo()`
     *     call to Auth0:
     *     https://auth0.com/docs/libraries/auth0js/v9#extract-the-authresult-and-get-user-info
     *   `authResult`: Correlates to the information returned by the
     *     `parseHash()` call to Auth0. Can include `accessToken`, `expiresIn`,
     *     and `idToken`, depending on the login method used.
     *     https://auth0.com/docs/libraries/auth0js/v9#extract-the-authresult-and-get-user-info
     */
    render: func,
    /**
     * Your Auth0 account domain (ex. myaccount.auth0.com).
     */
    domain: string.isRequired,
    /**
     * Your Auth0 client_id.
     */
    clientID: string.isRequired,
    /**
     * Specify whether to start the authorization flow. Use `true` to specify
     * that you would like the user to be logged in, otherwise `false`.
     */
    authorize: bool,
    /**
     * Execute a function after authorization. Received an object with 2
     * properties:
     *   `userInfo`: Correlates to the information returned by the `userInfo()`
     *     call to Auth0:
     *     https://auth0.com/docs/libraries/auth0js/v9#extract-the-authresult-and-get-user-info
     *   `authResult`: Correlates to the information returned by the
     *     `parseHash()` call to Auth0. Can include `accessToken`, `expiresIn`,
     *     and `idToken`, depending on the login method used.
     *     https://auth0.com/docs/libraries/auth0js/v9#extract-the-authresult-and-get-user-info
     */
    onAuthorize: func,
    /**
     * Execute a function if authorization fails. Receives a single argument
     * consisting of the error object.
     */
    onError: func,
    /**
     * Open the authorization flow in a popup; useful for single-page apps or
     * flows where you do not wish to interrupt the current page state.
     */
    popup: bool,
    /**
     * Specify `true` to disable automatic renewal of an Auth0 session.
     */
    disableAutoRenew: bool,
    /**
     * The default audience to be used for requesting Auth0 API access.
     */
    audience: string,
    /**
     * Specifies the connection to use rather than presenting all connections
     * available to the client.
     */
    connection: string,
    /**
     * The default scope(s) used by the application.
     * Using scopes can allow you to return specific claims for specific fields
     * in your request. You should read the Auth0 documentation on scopes for
     * further details.
     */
    scope: string,
    /**
     * This option is omitted by default. Can be set to `"form_post"` in order
     * to send the token or code to the `redirectUri` via `POST`. Supported
     * values are `"query"`, `"fragment"` and `"form_post"`.
     */
    responseMode: string,
    /**
     * The default `responseType` used. It can be any space separated list of
     * the values `"code"`, `"token"`, or `"id_token"`. It defaults to
     * `"token"`, unless a `redirectUri` is provided, then it defaults to
     * `"code"`.
     */
    responseType: string,
    /**
     * The default `redirectUri` used. Defaults to an empty string (none).
     */
    redirectUri: string,
    /**
     * An arbitrary value that should be maintained across redirects.
     * It is useful to mitigate CSRF attacks and for any contextual information
     * (for example, a return URL) that you might need after the authentication
     * process is finished. For more information, see the Auth0 state parameter
     * documentation.
     */
    state: string,
    /**
     * A value in seconds; leeway to allow for clock skew with regard to JWT
     * expiration times.
     */
    leeway: number,
    /**
     * Disables the deprecation warnings, defaults to `false`.
     */
    disableDeprecationWarnings: bool,
  };
  /* eslint-enable react/no-unused-prop-types */

  static defaultProps = {
    authorize: false,
    popup: false,
  };

  static get AUTHORIZATION_DONE() {
    return !!(localStorage.getItem(CHANNEL) || localStorage.getItem(SESSION));
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
    if (
      ('authorize' in nextProps &&
        nextProps.authorize !== this.props.authorize) ||
      nextProps.domain !== this.props.domain ||
      nextProps.clientID !== this.props.clientID ||
      nextProps.audience !== this.props.audience ||
      nextProps.connection !== this.props.connection ||
      nextProps.scope !== this.props.scope ||
      nextProps.responseMode !== this.props.responseMode ||
      nextProps.redirectUri !== this.props.redirectUri ||
      nextProps.leeway !== this.props.leeway ||
      nextProps.disableDeprecationWarnings !==
        this.props.disableDeprecationWarnings
    ) {
      this.auth = this.getAuthClient(nextProps);
      this.authCheck(nextProps);
    } else if (nextProps.disableAutoRenew && this.renewalTimer) {
      clearTimeout(this.renewalTimer);
    }
  }

  authCheck(props) {
    if (this.renewalTimer) {
      clearTimeout(this.renewalTimer);
    }

    if (props.authorize) {
      this.authorize(props);
    } else {
      localStorage.removeItem(CHANNEL);
      localStorage.removeItem(SESSION);

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

  persistSession({
    authResult = this.state.authResult,
    userInfo = this.state.userInfo,
  }) {
    localStorage.setItem(
      SESSION,
      JSON.stringify({
        authResult,
        userInfo,
        expiration: new Date(
          Date.now() + authResult.expiresIn * 1000
        ).toISOString(),
      })
    );
  }

  renew = () =>
    new Promise((resolve, reject) => {
      this.auth.checkSession({}, (err, authResult) => {
        if (authResult) {
          this.persistSession({ authResult });
          // From https://tools.ietf.org/html/rfc6749#section-4.2.2, expiresIn
          // is in seconds but setTimeout takes a delay in milliseconds
          this.scheduleRenewal(authResult.expiresIn * 1000);
        }

        const error =
          err || (authResult ? null : new Error('No authorization result'));

        if (error) {
          reject(error);
        } else {
          resolve(authResult);
        }
      });
    });

  scheduleRenewal(delay) {
    if (this.renewalTimer) {
      clearTimeout(this.renewalTimer);
    }

    this.renewalTimer = setTimeout(async () => {
      try {
        this.setState(
          {
            authResult: await this.renew(),
          },
          () => {
            this.props.onAuthorize &&
              this.props.onAuthorize({
                authResult: this.state.authResult,
                userInfo: this.state.userInfo,
              });
          }
        );
      } catch (error) {
        this.setState(
          {
            error,
            authResult: null,
            userInfo: null,
          },
          () => {
            this.props.onError && this.props.onError(error);
          }
        );
      }
    }, delay);
  }

  async login() {
    try {
      const existingSession = localStorage.getItem(SESSION);
      const session = existingSession && JSON.parse(existingSession);
      const expiration = session && new Date(session.expiration);
      const now = new Date();
      // eslint-disable-next-line no-nested-ternary
      const authResult = expiration
        ? expiration > now
          ? session.authResult
          : await this.renew()
        : await this.parse();
      const userInfo = session
        ? session.userInfo
        : await this.userInfo(authResult.accessToken);

      this.persistSession({ authResult, userInfo });

      if (!this.props.disableAutoRenew) {
        // Existing sessions will not have `authResult.expiresIn` up-to-date
        // since, for existing sessions, the logic above will return
        // whathever is in localStorage. We rely on the expiration
        // field instead.
        if (expiration) {
          this.scheduleRenewal(expiration - new Date());
        } else {
          // From https://tools.ietf.org/html/rfc6749#section-4.2.2, expiresIn
          // is in seconds but setTimeout takes a delay in milliseconds
          this.scheduleRenewal(authResult.expiresIn * 1000);
        }
      }

      this.setState(
        {
          error: null,
          authResult,
          userInfo,
        },
        () => {
          this.props.onAuthorize &&
            this.props.onAuthorize({
              authResult,
              userInfo,
            });
        }
      );
    } catch (error) {
      this.setState(
        {
          error,
          authResult: null,
          userInfo: null,
        },
        () => {
          this.props.onError && this.props.onError(error);
        }
      );
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

    if (!render) {
      return null;
    }

    return render({ ...this.state });
  }
}
