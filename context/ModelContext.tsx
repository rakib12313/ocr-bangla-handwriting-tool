import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEFAULT_MODEL, AVAILABLE_MODELS } from '../constants';

interface ModelContextType {
  model: string;
  setModel: (model: string) => void;
  getModelName: (id: string) => string;
}

const ModelContext = createContext<ModelContextType | undefined>(undefined);

export const ModelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [model, setModel] = useState<string>(() => {
    return localStorage.getItem('sebon_model') || DEFAULT_MODEL;
  });

  useEffect(() => {
    localStorage.setItem('sebon_model', model);
  }, [model]);

  const getModelName = (id: string) => {
    return AVAILABLE_MODELS.find(m => m.id === id)?.name || id;
  };

  return (
    <ModelContext.Provider value={{ model, setModel, getModelName }}>
      {children}
    </ModelContext.Provider>
  );
};

export const useModel = () => {
  const context = useContext(ModelContext);
  if (!context) throw new Error('useModel must be used within a ModelProvider');
  return context;
};
