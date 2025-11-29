import {
  BarChart3,
  Users,
  CreditCard,
  ArrowUpRight,
  FileText,
  Megaphone,
  Vault,
  LifeBuoy,
  Wallet,
  LogOut,
  ArrowDownRight,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const navigationItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: BarChart3,
  },
  {
    title: "Clients",
    url: "/clients",
    icon: Users,
  },
  {
    title: "Deposits",
    url: "/deposits",
    icon: CreditCard,
  },
  {
    title: "Withdrawals",
    url: "/withdrawals",
    icon: ArrowUpRight,
  },
  {
    title: "Investment Withdrawals",
    url: "/investment-withdrawals",
    icon: ArrowDownRight,
  },
  {
    title: "Transaction History",
    url: "/transaction-history",
    icon: FileText,
  },
  {
    title: "News & Broadcasts",
    url: "/news",
    icon: Megaphone,
  },
  {
    title: "Admin Accounting",
    url: "/admin-accounting",
    icon: Vault,
  },
  {
    title: "Payment Settings",
    url: "/payment-settings",
    icon: Wallet,
  },
  {
    title: "Support",
    url: "/support",
    icon: LifeBuoy,
  },
];

const authItems = [
  {
    title: "Sign Out",
    url: "/logout",
    icon: LogOut,
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar className="bg-sidebar border-r border-card-border">
      <SidebarContent>
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary-foreground" />
            </div>
            {!isCollapsed && (
              <h1 className="text-lg font-bold text-foreground">
                Finance Admin
              </h1>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground">
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                          isActive
                            ? // ACTIVE STATE
                              "bg-sidebar-accent text-sidebar-accent-foreground shadow-glow"
                            : // INACTIVE + HOVER STATE
                              "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        }`
                      }
                    >
                      <item.icon className="w-5 h-5" />
                      {!isCollapsed && (
                        <span className="font-medium">{item.title}</span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground">
            Account
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {authItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                          isActive
                            ? "bg-destructive text-destructive-foreground"
                            : // use sidebar tokens here as well
                              "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        }`
                      }
                    >
                      <item.icon className="w-5 h-5" />
                      {!isCollapsed && (
                        <span className="font-medium">{item.title}</span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
