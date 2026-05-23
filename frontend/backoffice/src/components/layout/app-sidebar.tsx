import {
  CheckSquare,
  CreditCard,
  FileText,
  LogOut,
  Mail,
  UserPlus,
  Users,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import zeuspayLogo from "@/assets/zeuspay-logo.svg";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { logout } from "@/features/auth/auth-api";
import { useAuthStore } from "@/features/auth/auth-store";
import { NAV_ITEMS, PATHS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const ICONS = {
  users: Users,
  userPlus: UserPlus,
  check: CheckSquare,
  file: FileText,
  card: CreditCard,
  mail: Mail,
} as const;

export function AppSidebar() {
  const navigate = useNavigate();
  const session = useAuthStore((s) => s.session);
  const clear = useAuthStore((s) => s.clear);

  const handleLogout = async () => {
    await logout();
    clear();
    navigate(PATHS.login);
  };

  const initials = session?.profile.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Sidebar>
      <SidebarHeader className="border-sidebar-border border-b p-4">
        <img
          src={zeuspayLogo}
          alt="ZeusPay"
          className="mx-auto h-10 w-auto max-w-[180px]"
        />
        <div className="mt-4 flex items-center gap-3">
          <Avatar className="size-10">
            {session?.profile.image ? (
              <AvatarImage src={session.profile.image} alt={session.profile.name} />
            ) : null}
            <AvatarFallback>{initials ?? "ZP"}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 text-left">
            <p className="truncate text-sm font-semibold">
              {session?.profile.name}
            </p>
            <p className="text-muted-foreground truncate text-xs">
              {session?.profile.email}
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => {
                const Icon = ICONS[item.icon];
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      render={
                        <NavLink
                          to={item.path}
                          className={({ isActive }) =>
                            cn(
                              "flex w-full items-center gap-2",
                              isActive && "bg-sidebar-accent font-medium",
                            )
                          }
                        />
                      }
                    >
                      <Icon className="size-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-sidebar-border border-t p-2">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2"
          onClick={handleLogout}
        >
          <LogOut className="size-4" />
          Cerrar sesión
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
