// src/components/ui/tooltip.jsx
import React, { createContext, useContext } from "react";

// Simple context provider (you can expand later)
const TooltipContext = createContext();

export function TooltipProvider({ children }) {
  return (
    <TooltipContext.Provider value={{}}>
      {children}
    </TooltipContext.Provider>
  );
}

// Optional: custom hook to consume context
export function useTooltip() {
  return useContext(TooltipContext);
}
