import React, { createContext, useState, useContext, useCallback } from 'react';
import toast from 'react-hot-toast';

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext deve ser usado dentro de AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [coordinates, setCoordinates] = useState(null);
  const [searchRadius, setSearchRadius] = useState(300);

  const addToHistory = useCallback((searchData) => {
    setSearchHistory(prev => {
      const newHistory = [searchData, ...prev.slice(0, 9)];
      localStorage.setItem('ftth_search_history', JSON.stringify(newHistory));
      return newHistory;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    localStorage.removeItem('ftth_search_history');
    toast.success('Histórico limpo com sucesso');
  }, []);

  const value = {
    loading,
    setLoading,
    results,
    setResults,
    searchHistory,
    addToHistory,
    clearHistory,
    coordinates,
    setCoordinates,
    searchRadius,
    setSearchRadius
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};