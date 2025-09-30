import { ReactNode } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface AuthLayoutProps {
  children: ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-primary/3 to-transparent" />
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-success/10 rounded-full blur-2xl" />
      </div>
      
      {/* Theme Toggle */}
      <header className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </header>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};