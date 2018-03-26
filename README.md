# React Auth0 Components

React components for making the authentication flows of Auth0 more declarative,
using React paradigms. Supports authorization via redirect or `popup` flows,
which can be used in single-page or multi-page apps.

## Getting started

You can install `react-auth0-components` via Yarn or npm:

```bash
# If using Yarn:
yarn add react-auth0-components

# If using npm:
npm install --save react-auth0-components
```

The core components from `react-auth0-components` are `<Authorize />` and
`<Callback />`. This module can be required via ES imports, CommonJS require,
or UMD.

```js
import { Authorize } from 'react-auth0-components';

// using require
const { Callback } = require('react-auth0-components');
```

**Important! If you are using Create React App, you will need to import the
ES5 versions of components.
These are located at `react-auth0-components/es5`, e.g.:**

```js
import { Authorize } from 'react-auth0-components/es5';

// using require
const { Callback } = require('react-auth0-components/es5');
```

## Usage

After importing a component, it can be rendered with the required
`render`, `domain`, and `clientID` props:

```jsx
import { Component } from 'react';
import { render } from 'react-dom';
import { Authorize } from 'react-auth0-components';

class App extends Component {
  render() {
    return (
      <Authorize
        domain={process.env.YOUR_AUTH0_DOMAIN}
        clientID={process.env.YOUR_AUTH0_CLIENT_ID}
        render={({ error, userInfo, authResult }) => {
          return (
            <div>
              conditionally render userInfo here...
            </div>
          );
        }} />
    );
  }
}

render((
  <App />
), document.getElementById('root'));
```

If you were to run this right now, it wouldn't actually do anything to login.
For that, you'll need to toggle the `authorize` prop:

```jsx
<Authorize
  authorize={true}
```

This will tell the component to kick off the authorization flow. By default,
this will redirect the page to the hosted Auth0 page. You can open it in a popup
for single-page apps with the `popup` prop:

```jsx
<Authorize
  authorize={true}
  popup={true}
```

Once the authorization is done, it will redirect to the callback page specified
in your Auth0 settings. This page will need to render the `<Callback />`
component to complete the flow:

```jsx
import { Callback } from 'react-auth0-components';

class CallbackPage extends Component {
  render() {
    return <Callback />;
  }
}
```

If this was triggered via the `popup` flow, there is nothing else that should be
done here. If not, maybe in the instance this is a multi-page app, you can redirect
back to the page with the `<Authorize />` component, using the `onReady` prop:

```jsx
import { Callback } from 'react-auth0-components';


// Example with react-router:
class CallbackPage extends Component {
  render() {
    return <Callback onReady={() => this.props.history.push('/')} />;
  }
}
```

_There are many nuances to this approach that may be difficult to capture via
documentation, so check the [examples directory](./examples) for an example
showing how to make this work with react-router using the `popup` and redirect
flows._

[See the styleguide](https://mozilla-frontend-infra.github.io/react-auth0-components)
for a listing of complete props.
