import React, {
  useEffect,
  useState,
  useCallback,
  useContext,
  useMemo,
} from 'react';
import { Key, pathToRegexp } from 'path-to-regexp';

export type RouterHandler = (path: string, queryString: string) => boolean;

export type GoToHandler = (
  params: Record<string, string>,
  queryParams: Record<string, string>
) => void;

export type Matcher = (path: string) => Record<string, string> | false;

export type RouterParams = { [x: string]: string };
export type RouterQueryParams = { [x: string]: string };

export type RouteType = {
  id: string;
  path: string;
};

export interface RoutesType {
  [propertyName: string]: RouteType;
}

export type RouterStateType = {
  routeId: string | undefined;
  params: RouterParams;
  queryParams: RouterQueryParams;
  hash: string;
};

export type RouterContextType = RouterStateType & {
  currentUrl: string;
  goTo: (
    route: RouteType,
    params?: RouterParams,
    queryParams?: RouterQueryParams,
    hash?: string
  ) => void;
  isRoute: (route: RouteType) => boolean;
};

export const createMatcher = (path: string) => {
  // If a path contains "@" at the end, make the parameter accept an empty string
  path = path.replace(/:([^/]+)\@/g, (_, match) => `:${match}([^/#?]*)`);
  var keys: Key[] = [];
  var re = pathToRegexp(path, keys);

  return function(pathname: string) {
    var m = re.exec(pathname);
    if (!m) return false;

    const params: Record<string, string> = {};
    for (const [i, key] of keys.entries()) {
      const param = m[i + 1];
      if (!param) continue;
      let value = decodeURIComponent(param);
      params[key.name] = value;
    }

    return params;
  };
};

export const paramRegex = /\/(:([^/?*+@]*)[*+?@]?)/g;

export const getRegexMatches = (string: string) => {
  let match;
  const matches: string[][] = [];
  while ((match = paramRegex.exec(string)) !== null) {
    matches.push(match.map(value => value));
  }

  return matches;
};

export const replaceUrlParams = (
  path: string,
  params: Record<string, string>,
  queryParams: Record<string, string>,
  hash: string
) => {
  const queryParamsString = Object.entries(queryParams)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    )
    .join('&');
  const hasQueryParams = queryParamsString !== '';
  let newPath = path;

  getRegexMatches(path).forEach(([_, paramKey, paramKeyWithoutColon]) => {
    const value = params[paramKeyWithoutColon];
    newPath = value
      ? newPath.replace(paramKey, value)
      : newPath.replace(`/${paramKey}`, '/');
  });

  return `${newPath}${hasQueryParams ? `?${queryParamsString}` : ''}${
    hash ? `#${hash}` : ''
  }`;
};

/**
 * Parse the query params into an object.
 *
 * @param searchString The search string. For example, `foo=bar&bar=foo`.
 */
export function getQueryParams(searchString: string) {
  const params = new URLSearchParams(searchString);
  const result: Record<string, string> = {};
  params.forEach((value, key) => {
    // each 'entry' is a [key, value] tupple
    result[key] = value;
  });
  return result;
}

const RouterContext = React.createContext<RouterContextType>(null as any);

export const Router: React.FC<{ routes: RoutesType }> = ({
  children,
  routes,
}) => {
  const matchers = useMemo(() => {
    return Object.values(routes).map((route): [Matcher, RouteType] => {
      return [createMatcher(route.path), route];
    });
  }, []);

  const findRoute = useCallback((): RouterStateType => {
    for (const [matcher, route] of matchers) {
      const params = matcher(window.location.pathname);
      if (params === false) continue;
      const queryParams = getQueryParams(window.location.search.substr(1));
      return {
        routeId: route.id,
        params,
        queryParams,
        hash: window.location.hash,
      };
    }

    return {
      routeId: undefined,
      params: {},
      queryParams: {},
      hash: window.location.hash,
    }; // This means that the current location matches none of our routes
  }, [matchers]);

  const [state, setState] = useState<RouterStateType>(findRoute());

  useEffect(() => {
    const findAndGoTo = () => setState(findRoute());

    // on change route
    window.onpopstate = (ev: PopStateEvent) => {
      if (ev.type === 'popstate') findAndGoTo();
    };
  }, []);

  const currentUrl = useMemo(
    () =>
      window.location.pathname + window.location.search + window.location.hash,
    [state]
  );

  const goTo = useCallback(
    (route: RouteType, params = {}, queryParams = {}, hash = '') => {
      const { id, path } = route;

      const newUrl: string = replaceUrlParams(path, params, queryParams, hash);
      window.history.pushState(null, '', newUrl);

      setState({
        routeId: id,
        params,
        queryParams,
        hash,
      });
    },
    []
  );

  const isRoute = useCallback(
    (route: RouteType) => route.id === state.routeId,
    [state.routeId]
  );

  return (
    <RouterContext.Provider
      value={{
        ...state,
        currentUrl,
        goTo,
        isRoute,
      }}
    >
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = () => useContext(RouterContext);
