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
                <span>
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </span>
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
                <span>
                  <Package />
                  <span>Products</span>
                </span>
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
                <span>
                  <ShoppingCart />
                  <span>Sales</span>
                </span>
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
