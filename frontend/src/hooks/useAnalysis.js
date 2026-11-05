import { useEffect, useState } from 'react';
import api from '../services/api';

const cache = new Map();

export function loadAnalysis(id) {
  if (!cache.has(id)) {
    const request = api.get(`/analysis/${id}`).then((response) => response.data.data.analysis);
    request.catch(() => cache.delete(id));
    cache.set(id, request);
  }
  return cache.get(id);
}

export function rememberAnalysis(analysis) {
  cache.set(analysis._id, Promise.resolve(analysis));
}

export function forgetAnalysis(id) {
  cache.delete(id);
}

export function useAnalysis(id) {
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    loadAnalysis(id)
      .then((data) => {
        if (active) setAnalysis(data);
      })
      .catch((err) => {
        if (active) setError(err?.response?.data?.message || 'Could not load this analysis.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  return { analysis, setAnalysis, error, loading };
}
