
"use client";

import { type ReactNode } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

interface HeaderProps {
  title: string;
  children?: ReactNode;
}

export function Header({ title, children }: HeaderProps) {
  const isMobile = useIsMobile();
  return (
    <div className="flex items-center justify-between gap-4 mb-8">
      <div className="flex items-center gap-2">
         {isMobile && <SidebarTrigger />}
        <h1 className="text-3xl font-headline text-primary">{title}</h1>
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
