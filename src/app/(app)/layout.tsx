
"use client";

import { useEffect, useState, Suspense } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/layout/SidebarNav";
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from "@/components/ui/progress";

function PageLoadingIndicator() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(0);
    const timer = setTimeout(() => setProgress(90), 0); 
    return () => clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (progress > 0) {
        setProgress(100);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [progress]);

  if (progress === 0 || progress === 100) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999]">
      <Progress value={progress} className="h-1" />
    </div>
  );
}


export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/secure-access');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
       <div className="flex h-screen w-screen items-center justify-center">
         <div className="flex flex-col items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
            </div>
         </div>
       </div>
    )
  }

  return (
    <SidebarProvider>
      <Suspense fallback={null}>
        <PageLoadingIndicator />
      </Suspense>
      <SidebarNav />
      <SidebarInset>
        <main className="p-4 sm:p-6 lg:p-8" id="main-content">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
