import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";
import { BarChart3 } from "lucide-react";

const Login = () => {
  return (
    <AuthLayout>
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          {/* Logo and Brand */}
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-primary shadow-glow">
              <BarChart3 className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="mt-4 text-3xl font-bold text-foreground">
              Running Finance
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">Admin Portal</p>
          </div>

          {/* Login Card */}
          <Card className="shadow-elevated border-card-border">
            <CardHeader className="text-center space-y-2 pb-4">
              <CardTitle className="text-2xl font-semibold text-card-foreground">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Sign in to access your admin dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <LoginForm />
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              © 2024 Running Finance. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login;
