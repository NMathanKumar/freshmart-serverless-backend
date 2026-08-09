import { useCallback, useEffect, useState } from 'react';

export type ApiResourceState = 'empty' | 'error' | 'loading' | 'ready';
const neverEmpty = () => false;

export const useApiResource = <T,>(loader: () => Promise<T>, isEmpty: (value: T) => boolean = neverEmpty) => {
  const [data, setData] = useState<T>();
  const [state, setState] = useState<ApiResourceState>('loading');
  const [attempt, setAttempt] = useState(0);

  const retry = useCallback(() => setAttempt((current) => current + 1), []);

  useEffect(() => {
    let active = true;
    setState('loading');
    void loader().then((value) => {
      if (!active) return;
      setData(value);
      setState(isEmpty(value) ? 'empty' : 'ready');
    }).catch(() => active && setState('error'));
    return () => { active = false; };
  }, [attempt, isEmpty, loader]);

  return { data, retry, state };
};
