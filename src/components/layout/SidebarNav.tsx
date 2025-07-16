"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarContent,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Package, ShoppingCart, Frown } from "lucide-react";
import React from "react";

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
             <Link href="/dashboard" passHref>
                <SidebarMenuButton
                asChild
                isActive={pathname === "/dashboard"}
                tooltip="Dashboard"
                >
                <React.Fragment>
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </React.Fragment>
                </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/products" passHref>
                <SidebarMenuButton
                asChild
                isActive={pathname.startsWith("/products")}
                tooltip="Products"
                >
                <React.Fragment>
                  <Package />
                  <span>Products</span>
                </React.Fragment>
                </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/sales" passHref>
                <SidebarMenuButton
                asChild
                isActive={pathname.startsWith("/sales")}
                tooltip="Sales"
                >
                <React.Fragment>
                  <ShoppingCart />
                  <span>Sales</span>
                </React.Fragment>
                </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
         {/* Footer can be added here */}
      </SidebarFooter>
    </Sidebar>
  );
}
