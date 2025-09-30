// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Separator } from "@/components/ui/separator";
// import { Eye, EyeOff, Mail, Lock, LogIn } from "lucide-react";
// import { toast } from "sonner";

// export const LoginForm = () => {
//   const [showPassword, setShowPassword] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//     rememberMe: false,
//   });
//   const navigate = useNavigate();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!formData.email || !formData.password) {
//       toast.error("Please fill in all fields");
//       return;
//     }

//     setIsLoading(true);

//     // Simulate login process with more realistic timing
//     setTimeout(() => {
//       toast.success("Login successful! Welcome back.");
//       navigate("/");
//     }, 1500);
//   };

//   const handleInputChange = (field: string, value: string | boolean) => {
//     setFormData(prev => ({
//       ...prev,
//       [field]: value
//     }));
//   };

//   return (
//     <div className="space-y-6">
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div className="space-y-2">
//           <Label htmlFor="email" className="text-sm font-medium text-foreground">
//             Email Address
//           </Label>
//           <div className="relative">
//             <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//             <Input
//               id="email"
//               type="email"
//               placeholder="admin@runningfinance.com"
//               value={formData.email}
//               onChange={(e) => handleInputChange("email", e.target.value)}
//               className="pl-10 h-12 bg-background border-input focus:border-ring transition-colors"
//               required
//             />
//           </div>
//         </div>

//         <div className="space-y-2">
//           <Label htmlFor="password" className="text-sm font-medium text-foreground">
//             Password
//           </Label>
//           <div className="relative">
//             <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//             <Input
//               id="password"
//               type={showPassword ? "text" : "password"}
//               placeholder="Enter your password"
//               value={formData.password}
//               onChange={(e) => handleInputChange("password", e.target.value)}
//               className="pl-10 pr-12 h-12 bg-background border-input focus:border-ring transition-colors"
//               required
//             />
//             <Button
//               type="button"
//               variant="ghost"
//               size="sm"
//               className="absolute right-0 top-0 h-12 px-3 py-2 hover:bg-transparent"
//               onClick={() => setShowPassword(!showPassword)}
//             >
//               {showPassword ? (
//                 <EyeOff className="h-4 w-4 text-muted-foreground" />
//               ) : (
//                 <Eye className="h-4 w-4 text-muted-foreground" />
//               )}
//             </Button>
//           </div>
//         </div>

//         <div className="flex items-center justify-between pt-2">
//           <div className="flex items-center space-x-2">
//             <Checkbox
//               id="remember"
//               checked={formData.rememberMe}
//               onCheckedChange={(checked) => handleInputChange("rememberMe", checked as boolean)}
//             />
//             <Label htmlFor="remember" className="text-sm font-normal text-muted-foreground">
//               Remember me
//             </Label>
//           </div>
//           <Button variant="link" className="px-0 text-sm text-primary hover:text-primary/80">
//             Forgot password?
//           </Button>
//         </div>

//         <Button
//           type="submit"
//           className="w-full h-12 bg-gradient-primary text-primary-foreground font-medium shadow-glow hover:shadow-lg transition-all duration-200"
//           disabled={isLoading}
//         >
//           {isLoading ? (
//             <div className="flex items-center gap-2">
//               <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
//               Signing in...
//             </div>
//           ) : (
//             <div className="flex items-center gap-2">
//               <LogIn className="h-4 w-4" />
//               Sign In
//             </div>
//           )}
//         </Button>
//       </form>

//       <div className="relative">
//         <div className="absolute inset-0 flex items-center">
//           <Separator className="w-full" />
//         </div>
//         <div className="relative flex justify-center text-xs uppercase">
//           <span className="bg-card px-2 text-muted-foreground">
//             Secure Admin Access
//           </span>
//         </div>
//       </div>

//       <div className="text-center text-xs text-muted-foreground">
//         Protected by industry-standard encryption
//       </div>
//     </div>
//   );
// };

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, User, Lock, LogIn } from "lucide-react";
import { toast } from "sonner";
import { RootState } from "@/store";
import { login } from "@/API/auth.api";

export const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    rememberMe: false,
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      // Dispatch the login action
      const resultAction = await dispatch(
        login({
          username: formData.username,
          password: formData.password,
        }) as any
      );

      // Check if login was successful
      if (login.fulfilled.match(resultAction)) {
        toast.success("Login successful! Welcome back.");
        navigate("/");
      } else if (login.rejected.match(resultAction)) {
        // Error is already handled in the slice, but we can show a toast
        toast.error((resultAction.payload as string) || "Login failed");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label
            htmlFor="username"
            className="text-sm font-medium text-foreground"
          >
            Username
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={formData.username}
              onChange={(e) => handleInputChange("username", e.target.value)}
              className="pl-10 h-12 bg-background border-input focus:border-ring transition-colors"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="text-sm font-medium text-foreground"
          >
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              className="pl-10 pr-12 h-12 bg-background border-input focus:border-ring transition-colors"
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-12 px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={formData.rememberMe}
              onCheckedChange={(checked) =>
                handleInputChange("rememberMe", checked as boolean)
              }
            />
            <Label
              htmlFor="remember"
              className="text-sm font-normal text-muted-foreground"
            >
              Remember me
            </Label>
          </div>
          <Button
            variant="link"
            className="px-0 text-sm text-primary hover:text-primary/80"
          >
            Forgot password?
          </Button>
        </div>

        <Button
          type="submit"
          className="w-full h-12 bg-gradient-primary text-primary-foreground font-medium shadow-glow hover:shadow-lg transition-all duration-200"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Signing in...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              Sign In
            </div>
          )}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">
            Secure Admin Access
          </span>
        </div>
      </div>

      <div className="text-center text-xs text-muted-foreground">
        Protected by industry-standard encryption
      </div>
    </div>
  );
};
