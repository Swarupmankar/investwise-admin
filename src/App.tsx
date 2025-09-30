// import { Toaster } from "@/components/ui/toaster";
// import { Toaster as Sonner } from "@/components/ui/sonner";
// import { TooltipProvider } from "@/components/ui/tooltip";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import { ThemeProvider } from "next-themes";
// import Index from "./pages/Index";
// import NotFound from "./pages/NotFound";
// import Login from "./pages/auth/Login";
// import Logout from "./pages/auth/Logout";
// import Clients from "./pages/Clients";
// import ClientProfile from "./pages/ClientProfile";
// import Deposits from "./pages/Deposits";
// import Withdrawals from "./pages/Withdrawals";
// import TransactionHistory from "./pages/TransactionHistory";
// import News from "./pages/News";
// import AdminAccounting from "./pages/AdminAccounting";
// import Support from "./pages/Support";
// import PaymentSettings from "./pages/PaymentSettings";
// import { AdminAccountingProvider } from "@/context/AdminAccountingContext";

// const queryClient = new QueryClient();

// const App = () => (
//   <QueryClientProvider client={queryClient}>
//     <ThemeProvider
//       attribute="class"
//       defaultTheme="system"
//       enableSystem
//       disableTransitionOnChange
//     >
//       <AdminAccountingProvider>
//         <TooltipProvider>
//           <Toaster />
//           <Sonner />
//           <BrowserRouter>
//             <Routes>
//               <Route path="/" element={<Index />} />
//               <Route path="/login" element={<Login />} />
//               <Route path="/logout" element={<Logout />} />
//               <Route path="/clients" element={<Clients />} />
//               <Route path="/clients/:id" element={<ClientProfile />} />
//               <Route path="/deposits" element={<Deposits />} />
//               <Route path="/withdrawals" element={<Withdrawals />} />
//               <Route path="/transaction-history" element={<TransactionHistory />} />
//               <Route path="/news" element={<News />} />
//               <Route path="/admin-accounting" element={<AdminAccounting />} />
//               <Route path="/support" element={<Support />} />
//               <Route path="/payment-settings" element={<PaymentSettings />} />
//               {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
//               <Route path="*" element={<NotFound />} />
//             </Routes>
//           </BrowserRouter>
//         </TooltipProvider>
//       </AdminAccountingProvider>
//     </ThemeProvider>
//   </QueryClientProvider>
// );

// export default App;

import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { BrowserRouter } from "react-router-dom";

import { AdminAccountingProvider } from "@/context/AdminAccountingContext";
import AppRoutes from "@/routes/AppRoutes";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AdminAccountingProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AdminAccountingProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
