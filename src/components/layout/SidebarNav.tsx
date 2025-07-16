"use client";

import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarContent,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Package, ShoppingCart, FileText, Frown } from "lucide-react";

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
          <Frown className="w-8 h-8 text-accent" />
          <h2 className="text-xl font-headline font-bold text-white">
            Freesia Finds
          </h2>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              href="/dashboard"
              isActive={pathname === "/dashboard"}
              tooltip="Dashboard"
            >
              <LayoutDashboard />
              <span>Dashboard</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              href="/products"
              isActive={pathname.startsWith("/products")}
              tooltip="Products"
            >
              <Package />
              <span>Products</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              href="/sales"
              isActive={pathname.startsWith("/sales")}
              tooltip="Sales"
            >
              <ShoppingCart />
              <span>Sales</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
         {/* Footer can be added here */}
      </SidebarFooter>
    </Sidebar>
  );
}
