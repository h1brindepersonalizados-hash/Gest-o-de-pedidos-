import React, { createContext, useContext, useState, useEffect } from 'react';

interface ValueVisibilityContextType {
  isVisible: boolean;
  toggleVisibility: () => void;
}

const ValueVisibilityContext = createContext<ValueVisibilityContextType | undefined>(undefined);

export function ValueVisibilityProvider({ children }: { children: React.ReactNode }) {
  const [isVisible, setIsVisible] = useState(() => {
    const saved = localStorage.getItem('valueVisibility');
    return saved ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem('valueVisibility', JSON.stringify(isVisible));
  }, [isVisible]);

  const toggleVisibility = () => setIsVisible(!isVisible);

  return (
    <ValueVisibilityContext.Provider value={{ isVisible, toggleVisibility }}>
      {children}
    </ValueVisibilityContext.Provider>
  );
}

export function useValueVisibility() {
  const context = useContext(ValueVisibilityContext);
  if (context === undefined) {
    throw new Error('useValueVisibility must be used within a ValueVisibilityProvider');
  }
  return context;
}
