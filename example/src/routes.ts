import { A, B, C, Home } from './pages';

export const routes = {
  home: {
    id: 'home',
    path: '/',
    component: Home,
  },
  a: {
    id: 'a',
    path: '/a',
    component: A,
  },
  b: {
    id: 'b',
    path: '/b/:b@',
    component: B,
  },
  c: {
    id: 'c',
    path: '/c/:c@/:b@',
    component: C,
  },
};
