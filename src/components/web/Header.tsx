
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState, useEffect } from 'react';
import { useCart } from '@/hooks/use-cart';

const navLinks = [
    { name: 'Flash Sales', href: '#flash-sales' },
    { name: 'New Sales', href: '#new-sales' },
    { name: 'All Products', href: '#all-products' },
];

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { totalItems } = useCart();
    const [isClient, setIsClient] = useState(false);
    
    useEffect(() => {
        setIsClient(true);
    }, []);

    const cartCount = totalItems();

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background shadow-sm">
            <div className="container flex h-20 max-w-screen-2xl items-center justify-between gap-4">
                <Link href="/" className="flex items-center gap-3">
                     <Image 
                        src="https://i.imgur.com/k7qYBOW.png" 
                        alt="Freesia Finds Logo" 
                        width={60} 
                        height={60} 
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
                     <Button variant="ghost" size="icon" asChild>
                        <Link href="/checkout">
                            <div className="relative">
                                <ShoppingBag className="h-6 w-6" />
                                {isClient && cartCount > 0 && (
                                    <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                                        {cartCount}
                                    </span>
                                )}
                            </div>
                            <span className="sr-only">Shopping Cart</span>
                        </Link>
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
