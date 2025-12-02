// src/AppRoutes.tsx
import React from "react";
import { Routes, Route } from "react-router-dom";

import ProtectedRoute from "@/routes/ProtectedRoute";
import PublicRoute from "@/routes/PublicRoute";

// Public pages
import Login from "@/pages/auth/Login";
import NotFound from "@/pages/NotFound";

// Protected pages (no layout required)
import Index from "@/pages/Index";
import Clients from "@/pages/Clients";
import ClientProfile from "@/pages/ClientProfile";
import Deposits from "@/pages/Deposits";
import Withdrawals from "@/pages/Withdrawals";
import TransactionHistory from "@/pages/TransactionHistory";
import News from "@/pages/News";
import AdminAccounting from "@/pages/AdminAccounting";
import PaymentSettings from "@/pages/PaymentSettings";
import Logout from "@/pages/auth/Logout";
import Support from "@/pages/Support";
import InvestmentWithdraw from "@/pages/InvestmentWithdraw";
import Investments from "@/pages/Investments";

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* public routes */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
      </Route>

      {/* protected routes (no layout required) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Index />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/clients/:id" element={<ClientProfile />} />
        <Route path="/deposits" element={<Deposits />} />
        <Route path="/investments" element={<Investments />} />
        <Route path="/withdrawals" element={<Withdrawals />} />
        <Route
          path="/investment-withdrawals"
          element={<InvestmentWithdraw />}
        />
        <Route path="/transaction-history" element={<TransactionHistory />} />
        <Route path="/news" element={<News />} />
        <Route path="/admin-accounting" element={<AdminAccounting />} />
        <Route path="/payment-settings" element={<PaymentSettings />} />
        <Route path="/support" element={<Support />} />
        <Route path="/logout" element={<Logout />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
