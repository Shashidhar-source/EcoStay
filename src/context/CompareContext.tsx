import React, { createContext, useContext, useState } from 'react';
import { Accommodation } from '../types';

interface CompareContextType {
  selectedProperties: Accommodation[];
  addToCompare: (property: Accommodation) => boolean;
  removeFromCompare: (id: string) => void;
  clearCompare: () => void;
  isCompared: (id: string) => boolean;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export const CompareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedProperties, setSelectedProperties] = useState<Accommodation[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  const isCompared = (id: string) => selectedProperties.some(p => p.id === id);

  const addToCompare = (property: Accommodation): boolean => {
    if (selectedProperties.length >= 4) {
      alert('You can compare a maximum of 4 properties at once.');
      return false;
    }
    if (!isCompared(property.id)) {
      setSelectedProperties(prev => [...prev, property]);
      setIsDrawerOpen(true);
      return true;
    }
    return false;
  };

  const removeFromCompare = (id: string) => {
    setSelectedProperties(prev => prev.filter(p => p.id !== id));
  };

  const clearCompare = () => {
    setSelectedProperties([]);
    setIsDrawerOpen(false);
  };

  return (
    <CompareContext.Provider
      value={{
        selectedProperties,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isCompared,
        isDrawerOpen,
        setIsDrawerOpen
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
};
