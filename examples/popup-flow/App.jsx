import { Component } from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import Home from './Home';
import Login from './Login';

// This component is only responsible for rendering routes.

// The Home component is the page that handles kicking
// off the authorization flow,
// and rendering user information once complete.

// The Login component is the page where Auth0 calls back to.

export default class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route path="/login" component={Login} />
          <Route exact path="/" component={Home} />
        </Switch>
      </BrowserRouter>
    );
  }
}
