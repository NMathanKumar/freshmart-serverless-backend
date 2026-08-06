import { useCallback, useEffect, useRef, useState } from 'react';

export type ApiResourceState = 'empty' | 'error' | 'loading' | 'ready';
const neverEmpty = () => false;

export const useApiResource = <T,>(loader: () => Promise<T>, isEmpty: (value: T) => boolean = neverEmpty) => {
  const [data, setData] = useState<T>();
  const [state, setState] = useState<ApiResourceState>('loading');
  const [attempt, setAttempt] = useState(0);

  const loaderRef = useRef(loader);
  loaderRef.current = loader;
  const isEmptyRef = useRef(isEmpty);
  isEmptyRef.current = isEmpty;

  const retry = useCallback(() => setAttempt((current) => current + 1), []);

  useEffect(() => {
    let active = true;
    setState('loading');
    void loaderRef.current().then((value) => {
      if (!active) return;
      setData(value);
      setState(isEmptyRef.current(value) ? 'empty' : 'ready');
    }).catch(() => active && setState('error'));
    return () => { active = false; };
  }, [attempt]);

  return { data, retry, state };
};
