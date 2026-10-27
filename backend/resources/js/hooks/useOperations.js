import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client.js';

export function useOperations() {
  const [data, setData] = useState({ equipment: [], agents: [], dashboard: null, forecast: null, equipmentTypes: [] });
  const [error, setError] = useState('');
  const [updatedAt, setUpdatedAt] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const [equipment, agents, dashboard, forecast, equipmentTypes] = await Promise.all([
        api.equipment(), api.agents(), api.dashboard(), api.forecast(), api.equipmentTypes(),
      ]);
      setData({ equipment, agents, dashboard, forecast, equipmentTypes });
      setUpdatedAt(new Date());
      setError('');
    } catch (cause) {
      setError(cause.message);
    }
  }, []);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, 15000);
    return () => clearInterval(timer);
  }, [refresh]);

  return { ...data, error, setError, updatedAt, refresh };
}
