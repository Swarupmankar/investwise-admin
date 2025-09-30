import React, { createContext, useContext } from "react";
import { useAdminAccounting } from "@/hooks/useAdminAccounting";

// Context type mirrors the hook's return type
export type AdminAccountingContextValue = ReturnType<typeof useAdminAccounting>;

const AdminAccountingContext = createContext<AdminAccountingContextValue | undefined>(undefined);

export const AdminAccountingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const value = useAdminAccounting();
  return (
    <AdminAccountingContext.Provider value={value}>
      {children}
    </AdminAccountingContext.Provider>
  );
};

export const useAdminAccountingContext = () => {
  const ctx = useContext(AdminAccountingContext);
  if (!ctx) {
    throw new Error("useAdminAccountingContext must be used within an AdminAccountingProvider");
  }
  return ctx;
};
