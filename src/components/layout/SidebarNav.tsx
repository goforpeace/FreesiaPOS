
"use client";

import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarContent,
  SidebarMenuSub,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Package, ShoppingCart, Settings, XCircle } from "lucide-react";
import React from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export function SidebarNav() {
  const pathname = usePathname();

  const isProductsActive = pathname.startsWith("/products");
  const isSalesActive = pathname.startsWith("/sales");

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
          <Image 
            src="https://i.imgur.com/k7qYBOW.png" 
            alt="Freesia Finds Logo" 
            width={40} 
            height={40} 
            className="rounded-md"
            data-ai-hint="logo"
          />
          <h2 className="text-xl font-headline font-bold text-white">
            Freesia Finds
          </h2>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
             <SidebarMenuButton
                asChild
                isActive={pathname === "/dashboard"}
                tooltip="Dashboard"
                >
                <Link href="/dashboard" className="flex items-center gap-2">
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <Collapsible asChild defaultOpen={isProductsActive}>
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                  isActive={isProductsActive}
                  tooltip="Products"
                  className="justify-between"
                  >
                  <span className="flex items-center gap-2">
                    <Package />
                    <span>Products</span>
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down size-5 transition-transform data-[state=open]:rotate-180 group-data-[collapsible=icon]:hidden"><path d="m6 9 6 6 6-6"/></svg>
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent asChild>
                <SidebarMenuSub>
                    <SidebarMenuItem>
                       <SidebarMenuSubButton href="/products" isActive={pathname === '/products'}>All Products</SidebarMenuSubButton>
                    </SidebarMenuItem>
                     <SidebarMenuItem>
                       <SidebarMenuSubButton href="/products/new" isActive={pathname === '/products/new'}>Add Product</SidebarMenuSubButton>
                     </SidebarMenuItem>
                    <SidebarMenuItem>
                       <SidebarMenuSubButton href="/products/rejected" isActive={pathname === '/products/rejected'}>Rejected Products</SidebarMenuSubButton>
                    </SidebarMenuItem>
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
          
          <Collapsible asChild defaultOpen={isSalesActive}>
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                  isActive={isSalesActive}
                  tooltip="Sales"
                  className="justify-between"
                  >
                  <span className="flex items-center gap-2">
                    <ShoppingCart />
                    <span>Sales</span>
                  </span>
                   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down size-5 transition-transform data-[state=open]:rotate-180 group-data-[collapsible=icon]:hidden"><path d="m6 9 6 6 6-6"/></svg>
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent asChild>
                <SidebarMenuSub>
                    <SidebarMenuItem>
                       <SidebarMenuSubButton href="/sales" isActive={pathname === '/sales'}>All Sales</SidebarMenuSubButton>
                    </SidebarMenuItem>
                     <SidebarMenuItem>
                       <SidebarMenuSubButton href="/sales/new" isActive={pathname === '/sales/new'}>New Sale</SidebarMenuSubButton>
                     </SidebarMenuItem>
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>

        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
           <SidebarMenuItem>
                <SidebarMenuButton
                href="#"
                asChild
                tooltip="Settings"
                >
                <span className="flex items-center gap-2">
                  <Settings />
                  <span>Settings</span>
                </span>
                </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
