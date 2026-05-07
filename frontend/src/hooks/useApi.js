import { useEffect, useState } from 'react';
import { api } from '../services/api.js';

export const useApi = (path, fallback) => {
  const [data, setData] = useState(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    api(path)
      .then((result) => active && setData(result))
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [path]);

  return { data, loading, error, setData };
};
