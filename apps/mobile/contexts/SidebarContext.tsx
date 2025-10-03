import React, { createContext, useContext, useState } from 'react';

interface SidebarContextType {
  sidebarVisible: boolean;
  setSidebarVisible: (visible: boolean) => void;
  sidebarWidth: number;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

interface SidebarProviderProps {
  children: React.ReactNode;
  sidebarWidth: number;
}

export const SidebarProvider: React.FC<SidebarProviderProps> = ({ 
  children, 
  sidebarWidth 
}) => {
  const [sidebarVisible, setSidebarVisible] = useState(false);

  return (
    <SidebarContext.Provider 
      value={{ 
        sidebarVisible, 
        setSidebarVisible, 
        sidebarWidth 
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};
