import { createContext, useContext, useState, useCallback } from 'react';
import { inventoryApi } from '../services/api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [dashboardStats, setDashboardStats] = useState(null);
  const [lowStockCount, setLowStockCount] = useState(0);

  const refreshDashboard = useCallback(async () => {
    try {
      const res = await inventoryApi.getDashboard();
      const stats = res.data.data;
      setDashboardStats(stats);
      setLowStockCount(stats.lowStockCount || 0);
    } catch (e) {
      // Non-critical — silently ignore
    }
  }, []);

  return (
    <AppContext.Provider value={{ dashboardStats, lowStockCount, refreshDashboard }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
