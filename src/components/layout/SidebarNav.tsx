"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarContent,
  useSidebar,
  SidebarMenuSub,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Package, ShoppingCart, PlusCircle, Settings } from "lucide-react";
import React from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "../ui/button";

export function SidebarNav() {
  const pathname = usePathname();
  const { state } = useSidebar();

  const isProductsActive = pathname.startsWith("/products");
  const isSalesActive = pathname.startsWith("/sales");

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
          <Image 
            src="https://placehold.co/128x128.png" 
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

          <Collapsible asChild defaultOpen={isProductsActive}>
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                  isActive={isProductsActive}
                  tooltip="Products"
                  className="justify-between"
                  >
                  <span>
                    <Package />
                    <span>Products</span>
                  </span>
                  <Button variant="ghost" size="icon" className="size-5 data-[state=open]:rotate-180 group-data-[collapsible=icon]:hidden">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6"/></svg>
                  </Button>
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent asChild>
                <SidebarMenuSub>
                    <SidebarMenuItem>
                       <Link href="/products" passHref>
                         <SidebarMenuSubButton isActive={pathname === '/products'}>All Products</SidebarMenuSubButton>
                       </Link>
                    </SidebarMenuItem>
                     <SidebarMenuItem>
                       <Link href="/products/new" passHref>
                         <SidebarMenuSubButton isActive={pathname === '/products/new'}>Add Product</SidebarMenuSubButton>
                       </Link>
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
                  <span>
                    <ShoppingCart />
                    <span>Sales</span>
                  </span>
                   <Button variant="ghost" size="icon" className="size-5 data-[state=open]:rotate-180 group-data-[collapsible=icon]:hidden">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6"/></svg>
                  </Button>
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent asChild>
                <SidebarMenuSub>
                    <SidebarMenuItem>
                       <Link href="/sales" passHref>
                         <SidebarMenuSubButton isActive={pathname === '/sales'}>All Sales</SidebarMenuSubButton>
                       </Link>
                    </SidebarMenuItem>
                     <SidebarMenuItem>
                       <Link href="/sales/new" passHref>
                         <SidebarMenuSubButton isActive={pathname === '/sales/new'}>New Sale</SidebarMenuSubButton>
                       </Link>
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
            <Link href="#" passHref>
                <SidebarMenuButton
                asChild
                tooltip="Settings"
                >
                <span>
                  <Settings />
                  <span>Settings</span>
                </span>
                </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
