import { useEffect, useState } from 'react';
import { api } from '../services/api.js';

export const useApi = (path, fallback) => {
  const [data, setData] = useState(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    let active = true;
    setLoading(true);
    setError('');
    api(path)
      .then((result) => active && setData(result))
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  };

  useEffect(() => {
    const cleanup = load();
    return () => {
      cleanup();
    };
  }, [path]);

  return { data, loading, error, setData, refresh: load };
};
