import { Component } from 'react';
import { Authorize } from 'react-auth0-components';

export default class Home extends Component {
  state = {
    // Start out the page not prompting the user to login
    authorize: false,
  };

  handleAuthorize = () => {
    // When the user clicks the button to login,
    // set authorize to true to tell the component
    // we want to kick off the login flow.
    this.setState({ authorize: true });
  };

  handleUnauthorize = () => {
    // When we click logout, reset the authorization flow/state.
    this.setState({ authorize: false });
  };

  render() {
    const { authorize } = this.state;

    /**
     * 1. We set popup on the component since we want to keep the user on this
     * page; it's a single-page app. Auth0 will redirect the popup to the Login
     * page once the flow is done, and the Login component handles that.
     *
     * 2. We pull `authorize` from state, which can be toggled based on whether
     * we are logged in or want to log in.
     *
     * 3. We set some data specific to out Auth0 client. Some users may need to
     * set these, and others may not.
     *
     * 4. Pass a render function prop which will receive an object with 3
     * properties: error, userInfo, and authResult. We should render the error
     * and not touch the other 2 properties if there is an error. If there is no
     * error, it's safe to render based on authResult or userInfo.
     */

    return (
      <Authorize
        popup
        authorize={authorize}
        domain="some auth0 domain like auth.mozilla.auth0.com"
        clientID="some auth0 client ID"
        redirectUri="optionally set the redirect URI"
        responseType="optionally set the response type"
        scope="optionally set what scopes you are requesting"
        render={({ error, userInfo, authResult }) => {
          /**
           * 1. If there isn't an error and we have userInfo, render the logout
           * button. Otherwise render a login button.
           *
           * 2. If there is an error, show it to the user.
           *
           * 3. If we have userInfo, render the gravatar contained in it.
           */
          return (
            <div>
              <h1>react-auth0-component test</h1>
              {!error && userInfo
                ? <button onClick={this.handleUnauthorize}>Logout</button>
                : <button onClick={this.handleAuthorize}>Login</button>
              }

              <br/>
              <br/>

              {error && <pre>{error.toString()}</pre>}
              {userInfo && (
                <img
                  src={userInfo.picture}
                  height={100}
                  width={100}
                  style={{ borderRadius: 50 }} />
              )}
            </div>
          );
        }} />
    );
  }
}
