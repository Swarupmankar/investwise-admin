// src/pages/auth/Logout.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { LogOut, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { logout } from "@/API/auth.api"; // adjust path

const Logout = () => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const dispatch: any = useDispatch();

  const handleLogout = async () => {
    setIsLoggingOut(true);

    // Clear auth state and localStorage
    dispatch(logout());

    // Provide feedback and nav
    toast.success("Logged out successfully");
    navigate("/login", { replace: true });
  };

  return (
    <DashboardLayout>
      <div className="flex min-h-[50vh] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <LogOut className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-xl font-semibold">
              Confirm Logout
            </CardTitle>
            <CardDescription>
              Are you sure you want to sign out of your admin account?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleLogout}
              disabled={isLoggingOut}
              variant="destructive"
              className="w-full"
            >
              {isLoggingOut ? "Signing out..." : "Yes, Sign Out"}
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Cancel
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Logout;
