import React, { useEffect, useMemo, useState } from 'react';
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
      href={route.path}
    >
      {label}
    </a>
  );
}

export default () => {
  const { routeId, onBeforeNavigate } = useRouter();
  const route = useMemo(() =>
    Object.values(routes).find(({ id }) => id === routeId)
  );

  const [value, setValue] = useState('');

  useEffect(
    () =>
      onBeforeNavigate(() =>
        value ? 'Are you sure you want to leave?' : undefined
      ),
    [value]
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

      <div>
        <div>{`Blocking: ${value ? 'Yes' : 'No'}`}</div>
        <input
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="Type something in here to block transition"
        />
      </div>

      {route ? <route.component /> : <div>This is a 404</div>}
    </div>
  );
};
