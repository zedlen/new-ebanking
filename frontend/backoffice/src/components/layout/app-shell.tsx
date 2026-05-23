import { Menu } from "lucide-react";
import { Outlet } from "react-router-dom";
import { EntityDrawerHost } from "@/components/entity/entity-drawer-host";
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export function AppShell() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b px-4 md:hidden">
          <SidebarTrigger aria-label="Abrir menú">
            <Menu className="size-4" />
          </SidebarTrigger>
          <span className="font-semibold">ZeusPay Backoffice</span>
        </header>
        <AppHeader />
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
        <EntityDrawerHost />
      </SidebarInset>
    </SidebarProvider>
  );
}
