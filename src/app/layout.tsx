
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/hooks/use-auth";
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Freesia Finds POS',
  description: 'Point of Sale for Freesia Finds',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400..900&family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          {children}
          <Toaster />
           <Link 
            href="https://www.facebook.com/freesia.finds"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-1/2 translate-y-1/2 right-0 z-50 bg-blue-600 text-white p-3 rounded-l-lg shadow-lg flex items-center gap-2 transform transition-transform hover:scale-105 animate-bounce"
            >
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path></svg>
            <span className="hidden sm:inline">Visit Page</span>
          </Link>
        </AuthProvider>
      </body>
    </html>
  );
}
