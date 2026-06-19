import { useEffect, useMemo, useRef, useState } from "react";

const queryStates = new Map();
const querySubscribers = new Map();
const queryRunners = new Map();
const queryTokens = new Map();

function queryId(queryKey) {
  return JSON.stringify(Array.isArray(queryKey) ? queryKey : [queryKey]);
}

function initialQueryState(initialData) {
  const data = typeof initialData === "function" ? initialData() : initialData;
  return {
    data,
    error: null,
    hasFetched: false,
    isFetching: false,
    isPending: data === undefined
  };
}

function getQueryState(id, initialData) {
  if (!queryStates.has(id)) {
    queryStates.set(id, initialQueryState(initialData));
  }
  return queryStates.get(id);
}

function updateQueryState(id, patch) {
  const next = {
    ...getQueryState(id),
    ...patch
  };
  queryStates.set(id, next);
  querySubscribers.get(id)?.forEach(listener => listener(next));
  return next;
}

function subscribeQuery(id, listener) {
  const listeners = querySubscribers.get(id) || new Set();
  listeners.add(listener);
  querySubscribers.set(id, listeners);
  return () => {
    listeners.delete(listener);
    if (!listeners.size) {
      querySubscribers.delete(id);
    }
  };
}

function runQuery(id, queryFn) {
  const token = Symbol(id);
  queryTokens.set(id, token);
  const current = getQueryState(id);
  updateQueryState(id, {
    error: null,
    isFetching: true,
    isPending: current.data === undefined
  });

  Promise.resolve()
    .then(queryFn)
    .then(data => {
      if (queryTokens.get(id) !== token) return;
      updateQueryState(id, {
        data,
        error: null,
        hasFetched: true,
        isFetching: false,
        isPending: false
      });
    })
    .catch(error => {
      if (queryTokens.get(id) !== token) return;
      updateQueryState(id, {
        error: error instanceof Error ? error : new Error(String(error)),
        hasFetched: true,
        isFetching: false,
        isPending: false
      });
    });
}

export const focusRoomQueryClient = {
  invalidateQueries({ queryKey } = {}) {
    if (!queryKey) {
      queryRunners.forEach(run => run());
      return;
    }
    queryRunners.get(queryId(queryKey))?.();
  }
};

export function QueryClientProvider({ children }) {
  return children;
}

export function useQuery({ queryKey, queryFn, initialData }) {
  const id = useMemo(() => queryId(queryKey), [queryKey]);
  const queryFnRef = useRef(queryFn);
  queryFnRef.current = queryFn;
  const [state, setState] = useState(() => getQueryState(id, initialData));

  useEffect(() => {
    setState(getQueryState(id, initialData));
    return subscribeQuery(id, setState);
  }, [id]);

  useEffect(() => {
    const run = () => runQuery(id, () => queryFnRef.current());
    queryRunners.set(id, run);
    if (!getQueryState(id, initialData).hasFetched) {
      run();
    }
    return () => {
      if (queryRunners.get(id) === run) {
        queryRunners.delete(id);
      }
    };
  }, [id]);

  return {
    ...state,
    isError: Boolean(state.error),
    refetch: () => queryRunners.get(id)?.()
  };
}

export function useQueryClient() {
  return focusRoomQueryClient;
}
