import React, { useMemo } from 'react';
import { useRouter } from 'little-react-router';
import { routes } from './routes';

function Link({ label, route, params }) {
  const { goTo } = useRouter();

  return (
    <a
      onClick={e => {
        e.preventDefault();
        goTo(route, params);
      }}
    >
      {label}
    </a>
  );
}

export default () => {
  const { routeId } = useRouter();
  const route = useMemo(() =>
    Object.values(routes).find(({ id }) => id === routeId)
  );

  return (
    <div className="App">
      <nav>
        <Link label="Home" route={routes.home} />
        <Link label="Link A" route={routes.a} />
        <Link label="Link B" route={routes.b} params={{ b: '' }} />
        <Link label="Link C" route={routes.c} params={{ c: '', d: '' }} />
        <a href="/404">404</a>
      </nav>

      {route ? <route.component /> : <div>This is a 404</div>}
    </div>
  );
};
