
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Menu, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState, useEffect } from 'react';
import { useCart } from '@/hooks/use-cart';
import { ClientOnly } from '@/components/ui/client-only';

const navLinks = [
    { name: 'Flash Sales', href: '/#flash-sales' },
    { name: 'New Arrivals', href: '/#new-arrivals' },
    { name: 'All Products', href: '/#all-products' },
];

const socialLinks = [
    { name: 'Facebook', href: 'https://www.facebook.com/freesia.finds', icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path></svg> },
    { name: 'Instagram', href: 'https://www.instagram.com/freesia.finds', icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.011 3.584-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.069-1.645-.069-4.85s.011-3.584.069-4.85c.149-3.225 1.664-4.771 4.919-4.919 1.266-.057 1.644-.069 4.85-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.358-.2 6.78-2.618 6.98-6.98.059-1.281.073-1.689.073-4.948s-.014-3.667-.072-4.947c-.2-4.358-2.618-6.78-6.98-6.98-1.281-.059-1.689-.073-4.948-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.441 1.441 1.441 1.441-.645 1.441-1.441-.645-1.44-1.441-1.44z"></path></svg> },
    { name: 'TikTok', href: 'https://www.tiktok.com/freesia.finds', icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-2.43.05-4.86-.95-6.69-2.8-1.95-2-3.02-4.84-3.02-7.58 0-2.58 1.02-5.07 2.72-6.91 1.67-1.8 3.98-2.82 6.3-2.79.03 1.5.02 3.01.01 4.52-.51-.15-1.03-.2-1.55-.15-1.23.11-2.45.62-3.44 1.34-.99.72-1.74 1.7-2.16 2.83-.24.66-.36 1.36-.37 2.06.02 1.51.52 2.98 1.48 4.13.97 1.16 2.41 1.78 3.93 1.73 1.53-.05 2.97-.67 4.09-1.77.9-1.28 1.3-2.84 1.3-4.41v-9.4c.02-.12.02-.23.02-.35z"></path></svg> },
    { name: 'WhatsApp', href: 'https://wa.me/+8801920709034', icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99 0-3.903-.52-5.687-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01s-.521.074-.792.372c-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.203 5.076 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"></path></svg> }
];

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { totalItems, setIsCartOpen } = useCart();
    
    const cartCount = totalItems();

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
            <div className="bg-secondary text-secondary-foreground">
                <div className="container flex h-10 max-w-screen-2xl items-center justify-between text-xs sm:text-sm">
                    <div className="flex items-center gap-2 font-medium">
                        <Phone className="h-4 w-4"/>
                        <span>Hotline: +8809649174632</span>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4">
                        {socialLinks.map(link => (
                             <Link key={link.name} href={link.href} target="_blank" rel="noopener noreferrer" className="transition-opacity hover:opacity-75">
                                {link.icon}
                                <span className="sr-only">{link.name}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
            <div className="container flex h-20 max-w-screen-2xl items-center justify-between gap-4">
                <Link href="/" className="flex items-center gap-3 ml-4">
                     <Image 
                        src="https://i.imgur.com/k7qYBOW.png" 
                        alt="Freesia Finds Logo" 
                        width={80} 
                        height={80} 
                        className="rounded-md"
                        data-ai-hint="logo"
                    />
                    <span className="font-bold font-headline text-2xl text-primary hidden sm:inline-block">Freesia Finds</span>
                </Link>

                <nav className="hidden md:flex items-center gap-8 text-lg font-medium">
                    {navLinks.map(link => (
                        <Link key={link.name} href={link.href} className="text-foreground/70 transition-colors hover:text-foreground">{link.name}</Link>
                    ))}
                </nav>

                <div className="flex items-center gap-2 sm:gap-4">
                     <Button variant="ghost" size="icon" onClick={() => setIsCartOpen(true)}>
                        <div className="relative">
                            <ShoppingBag className="h-6 w-6" />
                            <ClientOnly>
                                {cartCount > 0 && (
                                    <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                                        {cartCount}
                                    </span>
                                )}
                            </ClientOnly>
                        </div>
                        <span className="sr-only">Shopping Cart</span>
                    </Button>

                    <div className="md:hidden">
                        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Menu className="h-6 w-6" />
                                    <span className="sr-only">Toggle Menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left">
                                <div className="p-6">
                                    <Link href="/" className="flex items-center gap-2 mb-8" onClick={() => setIsMenuOpen(false)}>
                                        <Image 
                                            src="https://i.imgur.com/k7qYBOW.png" 
                                            alt="Freesia Finds Logo" 
                                            width={50} 
                                            height={50} 
                                            className="rounded-md"
                                            data-ai-hint="logo"
                                        />
                                        <span className="font-bold font-headline text-lg text-primary">Freesia Finds</span>
                                    </Link>
                                    <nav className="flex flex-col gap-4">
                                        {navLinks.map(link => (
                                            <Link 
                                                key={link.name} 
                                                href={link.href} 
                                                className="text-lg font-medium"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                {link.name}
                                            </Link>
                                        ))}
                                    </nav>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </header>
    );
}
