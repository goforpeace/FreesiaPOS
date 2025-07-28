
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Search, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState, useEffect } from 'react';
import { useCart } from '@/hooks/use-cart';

const navLinks = [
    { name: 'New Arrival', href: '#' },
    { name: 'All Products', href: '#all-products' },
    { name: 'Offer Sale', href: '#' },
];

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { totalItems } = useCart();
    const [cartCount, setCartCount] = useState(0);

    // This useEffect ensures the cart count is updated on the client-side
    // to avoid hydration mismatch errors.
    useEffect(() => {
        setCartCount(totalItems());
    }, [totalItems, totalItems()]);

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                     <Image 
                        src="https://i.imgur.com/k7qYBOW.png" 
                        alt="Freesia Finds Logo" 
                        width={40} 
                        height={40} 
                        className="rounded-md bg-white p-1"
                        data-ai-hint="logo"
                    />
                    <span className="font-bold font-headline text-lg text-primary">Freesia Finds</span>
                </Link>

                <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                    {navLinks.map(link => (
                        <Link key={link.name} href={link.href} className="text-foreground/60 transition-colors hover:text-foreground/80">{link.name}</Link>
                    ))}
                </nav>

                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="hidden md:inline-flex">
                        <Search className="h-5 w-5" />
                        <span className="sr-only">Search</span>
                    </Button>
                     <Button variant="ghost" size="icon" asChild>
                        <Link href="/checkout">
                            <div className="relative">
                                <ShoppingBag className="h-5 w-5" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
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
                                    <Menu className="h-5 w-5" />
                                    <span className="sr-only">Toggle Menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left">
                                <div className="p-6">
                                    <Link href="/" className="flex items-center gap-2 mb-8">
                                        <Image 
                                            src="https://i.imgur.com/k7qYBOW.png" 
                                            alt="Freesia Finds Logo" 
                                            width={40} 
                                            height={40} 
                                            className="rounded-md bg-white p-1"
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
