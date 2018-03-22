import { Component } from 'react';
import { Callback } from 'react-auth0-component';

// This page is rendered when Auth0 calls back to our application
// after the authorization flow. Since this is a redirect-based app,
// and the flow occurred in the previous page, we need to render the
// Callback component, then specify what to do next. In this example,
// we are going to return to our homepage to render the logged in user.
export default class Login extends Component {
  render() {
    return (
      <Callback
        onReady={() => this.props.history.push('/')}
      />
    );
  }
}
