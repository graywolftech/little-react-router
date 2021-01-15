import React from 'react';
import { getRegexMatches, replaceUrlParams, Router } from './index';
import { routes, Root } from './mocks';
import { act } from 'react-dom/test-utils';
import { createMatcher } from '.';
import { test } from 'uvu';
import assert from 'uvu/assert';
import { jsdom } from './setup';
import { render, screen, fireEvent } from '@testing-library/react';

export function reset() {
  window.document.title = '';
  window.document.head.innerHTML = '';
  window.document.body.innerHTML = '<main></main';

  jsdom.reconfigure({
    url: 'https://www.test.com/',
  });
}

test.before.each(reset);

test('should render a Router on the home page', () => {
  // arrange
  render(
    <Router routes={routes}>
      <Root />
    </Router>
  );

  // assert
  assert.ok(screen.getByText('Welcome home'));
});

test('should navigate away from homepage when we click a link button', () => {
  // arrange
  render(
    <Router routes={routes}>
      <Root />
    </Router>
  );

  // act
  fireEvent.click(screen.getByText('go to about'));

  // assert
  assert.not(screen.queryByText('Welcome home'));
});

test('should navigate to the About Us page', () => {
  // arrange
  render(
    <Router routes={routes}>
      <Root />
    </Router>
  );

  // act
  fireEvent.click(screen.getByText('go to about'));

  // assert
  assert.ok(screen.getByText('About us'));
});

test('should navigate to the Picture Gallery using params', () => {
  // arrange
  render(
    <Router routes={routes}>
      <Root />
    </Router>
  );

  // act
  fireEvent.click(screen.getByText('go to picture 2'));

  // assert
  assert.ok(screen.getByText('Browsing picture 2'));
});

test('should navigate to the Picture Gallery using query params', () => {
  // arrange
  render(
    <Router routes={routes}>
      <Root />
    </Router>
  );

  // act
  fireEvent.click(screen.getByText('go to picture 1'));

  // assert
  assert.ok(screen.getByText('Browsing picture 1'));

  fireEvent.click(screen.getByText('go to about'));
  assert.throws(() => screen.getByText('Browsing picture 1'));

  // Simulate "window.location.back()"
  jsdom.reconfigure({
    url: 'https://test.com/gallery2?imageId=1',
  });

  act(
    () =>
      window.onpopstate &&
      window.onpopstate({ type: 'popstate' } as PopStateEvent)
  );

  assert.ok(screen.getByText('Browsing picture 1'));
});

test('navigates to about with a hash', () => {
  // arrange
  render(
    <Router routes={routes}>
      <Root />
    </Router>
  );

  // act
  fireEvent.click(screen.getByText('go to about with hash'));

  // assert
  assert.ok(screen.getByText('About us'));
  assert.ok(screen.getByText('/about#test-hash'));

  fireEvent.click(screen.getByText('go home'));
  assert.ok(screen.getByText('/'));

  // Simulate "window.location.back()"
  jsdom.reconfigure({
    url: 'https://test.com/about#test-hash',
  });

  act(
    () =>
      window.onpopstate &&
      window.onpopstate({ type: 'popstate' } as PopStateEvent)
  );

  //.ok assert(screen.getByText('Browsing picture 1'))
  assert.ok(screen.getByText('/about#test-hash'));
});

test('createMatcher should match empty string', () => {
  let matcher = createMatcher('/:a/:b');
  let result = matcher('/a/b');
  assert.equal(result, { a: 'a', b: 'b' });

  matcher = createMatcher('/:a/:b@');
  result = matcher('/a/');
  assert.equal(result, { a: 'a' });
});

test('getRegexMatches can find matches', () => {
  assert.equal(getRegexMatches('/:test/:one?/:two*/:three+'), [
    ['/:test', ':test', 'test'],
    ['/:one?', ':one?', 'one'],
    ['/:two*', ':two*', 'two'],
    ['/:three+', ':three+', 'three'],
  ]);
});

test('replaceUrlParams should render a Router on the home page', () => {
  assert.equal(
    replaceUrlParams(
      '/:test/:one/:two*/:three+/:four@',
      {
        test: 'a',
        one: 'b/c',
        two: 'd',
        three: 'e',
        four: 'f',
      },
      {},
      ''
    ),
    '/a/b/c/d/e/f'
  );
});

test('replaceUrlParams should render with empty string', () => {
  assert.equal(
    replaceUrlParams(
      '/test/:a@/:b@',
      {
        a: '',
        b: '',
      },
      {},
      ''
    ),
    '/test//'
  );
});

test.run();
