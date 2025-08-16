
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/hooks/use-auth";
import { FacebookPixel } from '@/components/analytics/FacebookPixel';
import { CartDialog } from '@/components/web/CartDrawer';
import { ClientOnly } from '@/components/ui/client-only';

const title = "Freesia Finds - Shop Now";
const description = "Discover exclusive collections and timeless pieces at Freesia Finds. Because you deserve what's rare!";
const logoUrl = "https://i.imgur.com/k7qYBOW.png";

export const metadata: Metadata = {
  title: title,
  description: description,
  icons: {
    icon: logoUrl,
    shortcut: logoUrl,
    apple: logoUrl,
  },
  openGraph: {
    title: title,
    description: description,
    images: [
      {
        url: logoUrl,
        width: 80,
        height: 80,
        alt: "Freesia Finds Logo",
      },
    ],
    type: 'website',
  },
   twitter: {
    card: "summary_large_image",
    title: title,
    description: description,
    images: [logoUrl],
  },
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
          <ClientOnly>
            <CartDialog />
          </ClientOnly>
          {children}
          <Toaster />
        </AuthProvider>
        <FacebookPixel />
      </body>
    </html>
  );
}
