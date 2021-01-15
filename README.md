# little-react-router

A little router for your React project.

Re-implementation of [react-tiniest-router](https://github.com/kitze/react-tiniest-router) with several improvements.

## Installation

```
npm install little-react-router
```

## Usage

1. Write the routes object.

```js
// routes.js
const routes = {
  home: {
    id: 'home',
    path: '/',
  },
  about: {
    id: 'about',
    path: '/about',
  },
  gallery: {
    id: 'gallery',
    path: '/gallery/:imageId',
  },
};
```

2. Wrap your app with the Router component

```js
// index.jsx or main.jsx or wherever your entrypoint is located
import { Router } from 'little-react-router';
import { routes } from './routes';
import { App } from './App';

<Router routes={routes}>
  <App />
</Router>;
```

3. Use the router using `useRouter`

- Use the `goTo` function for navigating to a route
- Use the `isRoute` function for checking if a route is currently active

```js
// In App.jsx
import React from 'react';
import { useRouter } from 'little-react-router';

export const App = () => {
  const { goTo, isRoute } = useRouter();

  return (
    <div>
      <div>
        <button onClick={() => goTo(routes.home)}>go home</button>
        <button onClick={() => goTo(routes.about)}>go to about</button>
        <button onClick={() => goTo(routes.gallery, { imageId: 1 })}>
          go to picture 1
        </button>
        <button onClick={() => goTo(routes.gallery, { imageId: 2 })}>
          go to picture 2
        </button>
        <button onClick={() => goTo(routes.gallery, { imageId: 3 })}>
          go to picture 3
        </button>
      </div>

      <br />

      {isRoute(routes.home) ? (
        <div>Welcome home</div>
      ) : isRoute(routes.about) ? (
        <div>About us</div>
      ) : isRoute(routes.gallery) ? (
        <Gallery />
      ) : (
        <div>This is a 404</div>
      )}
    </div>
  );
};
```

4. You also get `params`, `queryParams`, `routeId`, `path` in the router object.

```js
const Gallery = () => {
  const { params } = useRouter();
  return <div>Browsing picture {params.imageId}</div>;
};
```

5. Use modifiers to create special parameters.

```js
// in routes.js
const routes = {
  zeroOrMore: {
    id: 'zeroOrMore',
    // Matches "/", "/hi" and "/hi/ciao"
    path: '/:foo*',
  },
  oneOrMore: {
    id: 'oneOrMore',
    // Matches "/hola" and "/hola/hallo" but not "/"
    path: '/:bar+',
  },
  optional: {
    id: 'optional',
    // Matches "/" or "/bonjour"
    path: '/:bar?',
  },
  emptyString: {
    id: 'emptyString',
    // qux matches an empty string meaning "/hi/hello" and "//hello" would both match
    // This is a special modifier that is implemented in this library and not in `path-to-regexp`
    path: '/:qux@/:quuz',
  },
};
```

> See [path-to-regexp](https://github.com/pillarjs/path-to-regexp) for more details.
